import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type {
  CardsRevealedPayload,
  DeckChangedPayload,
  JoinPayload,
  KickParticipantPayload,
  MasterChangedPayload,
  ParticipantPayload,
  ParticipantRenamedPayload,
  ParticipantReconnectedPayload,
  PublicModeChangedPayload,
  RenameSelfPayload,
  Room,
  RoomStatePayload,
  SelectCardPayload,
  SetDeckPayload,
  SetTaskPayload,
  SetTitlePayload,
  TaskUpdatedPayload,
  TitleUpdatedPayload,
  TogglePublicModePayload,
  TransferMasterPayload,
} from '@vadim-codes/poker-contracts';
import { RoomService } from './room.service';

const GRACE_MS = 60_000;
const SPECIAL_CARDS = ['?', '☕', '∞'];

@WebSocketGateway({ path: '/api/socket.io' })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server!: Server;

  /** socketId → { roomId, sessionId } — for disconnect lookup */
  private readonly socketMeta = new Map<string, { roomId: string; sessionId: string }>();

  /** `${roomId}:${sessionId}` → timer for 60s grace period */
  private readonly graceTimers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly roomService: RoomService) {}

  handleConnection(_client: Socket): void {}

  handleDisconnect(client: Socket): void {
    const result = this.roomService.markDisconnected(client.id);
    this.socketMeta.delete(client.id);
    if (!result) {
      return;
    }

    const { roomId, sessionId } = result;
    this.server.to(roomId).emit('participantDisconnected', { sessionId });

    const key = `${roomId}:${sessionId}`;
    const timer = setTimeout(async () => {
      this.graceTimers.delete(key);
      await this.roomService.removeParticipant(roomId, sessionId);
      this.server.to(roomId).emit('participantLeft', { sessionId });
    }, GRACE_MS);
    this.graceTimers.set(key, timer);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload
  ): Promise<void> {
    const { roomId, sessionId, name } = payload;
    const room = await this.roomService.getRoom(roomId);

    if (!room) {
      client.emit('roomNotFound', { roomId });
      return;
    }

    // Cancel any pending grace-period eviction for this slot
    const key = `${roomId}:${sessionId}`;
    const existing = this.graceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      this.graceTimers.delete(key);
    }

    const isReconnect = room.participants.has(sessionId);

    if (isReconnect) {
      await this.roomService.reconnectParticipant(roomId, sessionId, client.id);
      const participant = room.participants.get(sessionId)!;
      const trimmedName = name.trim().slice(0, 32);
      if (trimmedName && trimmedName !== participant.name) {
        participant.name = trimmedName;
        const renamedPayload: ParticipantRenamedPayload = { sessionId, name: trimmedName };
        client.to(roomId).emit('participantRenamed', renamedPayload);
      }
      // Tell everyone else this participant is back online
      const reconnectedPayload: ParticipantReconnectedPayload = { sessionId };
      client.to(roomId).emit('participantReconnected', reconnectedPayload);
    } else {
      const isFirstParticipant = room.participants.size === 0;
      await this.roomService.addParticipant(roomId, {
        sessionId,
        socketId: client.id,
        name,
        selectedCard: null,
      });
      if (isFirstParticipant) {
        this.roomService.setMaster(roomId, sessionId);
      }
    }

    this.socketMeta.set(client.id, { roomId, sessionId });
    await client.join(roomId);

    client.emit('roomState', this.buildRoomState(room));

    if (!isReconnect) {
      const participant = room.participants.get(sessionId)!;
      const participantPayload: ParticipantPayload = {
        sessionId,
        name: participant.name,
        hasVoted: participant.selectedCard !== null,
        isConnected: true,
      };
      client.to(roomId).emit('participantJoined', { participant: participantPayload });
    }
  }

  @SubscribeMessage('selectCard')
  async handleSelectCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SelectCardPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }

    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.state !== 'voting') {
      return;
    }

    const participant = room.participants.get(sessionId);
    if (!participant) {
      return;
    }

    const allValues = [...room.deckValues, ...SPECIAL_CARDS];
    if (!allValues.includes(payload.value)) {
      return;
    }

    participant.selectedCard = payload.value;
    this.server.to(roomId).emit('cardSelected', { sessionId });
  }

  @SubscribeMessage('unselectCard')
  async handleUnselectCard(@ConnectedSocket() client: Socket): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }

    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.state !== 'voting') {
      return;
    }

    const participant = room.participants.get(sessionId);
    if (!participant) {
      return;
    }

    participant.selectedCard = null;
    this.server.to(roomId).emit('cardUnselected', { sessionId });
  }

  @SubscribeMessage('reveal')
  async handleReveal(@ConnectedSocket() client: Socket): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }

    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.state !== 'voting') {
      return;
    }

    const isMaster = room.masterSessionId === sessionId;
    if (!isMaster && !room.isPublicMode) {
      return;
    }

    room.state = 'revealed';

    const votes: Record<string, string | null> = {};
    for (const p of room.participants.values()) {
      if (p.selectedCard !== null) {
        votes[p.sessionId] = p.selectedCard;
      }
    }

    const payload: CardsRevealedPayload = { votes };
    this.server.to(roomId).emit('cardsRevealed', payload);
  }

  @SubscribeMessage('transferMaster')
  async handleTransferMaster(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TransferMasterPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.masterSessionId !== sessionId || payload.sessionId === sessionId) {
      return;
    }
    const updated = this.roomService.transferMaster(roomId, payload.sessionId);
    if (!updated) {
      return;
    }
    const response: MasterChangedPayload = { sessionId: payload.sessionId };
    this.server.to(roomId).emit('masterChanged', response);
  }

  @SubscribeMessage('togglePublicMode')
  async handleTogglePublicMode(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TogglePublicModePayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.masterSessionId !== sessionId) {
      return;
    }
    const updated = this.roomService.setPublicMode(roomId, payload.enabled);
    if (!updated) {
      return;
    }
    const response: PublicModeChangedPayload = { enabled: updated.isPublicMode };
    this.server.to(roomId).emit('publicModeChanged', response);
  }

  @SubscribeMessage('setTitle')
  async handleSetTitle(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SetTitlePayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.masterSessionId !== sessionId) {
      return;
    }
    const updated = this.roomService.setTitle(roomId, payload.title);
    if (!updated) {
      return;
    }
    const response: TitleUpdatedPayload = { title: updated.title };
    this.server.to(roomId).emit('titleUpdated', response);
  }

  @SubscribeMessage('setTask')
  async handleSetTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SetTaskPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || (room.masterSessionId !== sessionId && !room.isPublicMode)) {
      return;
    }
    this.roomService.setTask(roomId, payload.task);
    const response: TaskUpdatedPayload = { task: room.currentTask };
    this.server.to(roomId).emit('taskUpdated', response);
  }

  @SubscribeMessage('setDeck')
  async handleSetDeck(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SetDeckPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.masterSessionId !== sessionId) {
      return;
    }
    const updated = this.roomService.setDeck(roomId, payload.deck, payload.deckValues);
    if (!updated) {
      return;
    }
    const response: DeckChangedPayload = { deck: updated.deck, deckValues: updated.deckValues };
    this.server.to(roomId).emit('deckChanged', response);
  }

  @SubscribeMessage('kickParticipant')
  async handleKickParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: KickParticipantPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.masterSessionId !== sessionId || payload.sessionId === sessionId) {
      return;
    }
    const target = room.participants.get(payload.sessionId);
    if (!target || target.socketId !== '') {
      return;
    }

    const key = `${roomId}:${payload.sessionId}`;
    const timer = this.graceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.graceTimers.delete(key);
    }

    await this.roomService.removeParticipant(roomId, payload.sessionId);
    this.server.to(roomId).emit('participantLeft', { sessionId: payload.sessionId });
  }

  @SubscribeMessage('reset')
  async handleReset(@ConnectedSocket() client: Socket): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }

    const { roomId, sessionId } = meta;
    const room = await this.roomService.getRoom(roomId);
    if (!room || room.state !== 'revealed') {
      return;
    }

    const isMaster = room.masterSessionId === sessionId;
    if (!isMaster && !room.isPublicMode) {
      return;
    }

    for (const p of room.participants.values()) {
      p.selectedCard = null;
    }
    room.state = 'voting';

    this.server.to(roomId).emit('roundReset');
  }

  @SubscribeMessage('renameSelf')
  async handleRenameSelf(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RenameSelfPayload
  ): Promise<void> {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      return;
    }
    const { roomId, sessionId } = meta;
    const trimmedName = payload.name?.trim();
    if (!trimmedName) {
      return;
    }
    const updated = this.roomService.renameParticipant(roomId, sessionId, trimmedName);
    if (!updated) {
      return;
    }
    const participant = updated.participants.get(sessionId)!;
    const response: ParticipantRenamedPayload = { sessionId, name: participant.name };
    this.server.to(roomId).emit('participantRenamed', response);
  }

  private buildRoomState(room: Room): RoomStatePayload {
    const isRevealed = room.state === 'revealed';
    const votes: Record<string, string | null> = {};

    const participants: ParticipantPayload[] = [];
    for (const p of room.participants.values()) {
      participants.push({
        sessionId: p.sessionId,
        name: p.name,
        hasVoted: p.selectedCard !== null,
        isConnected: p.socketId !== '',
      });
      if (isRevealed && p.selectedCard !== null) {
        votes[p.sessionId] = p.selectedCard;
      }
    }

    return {
      id: room.id,
      title: room.title,
      currentTask: room.currentTask,
      deck: room.deck,
      deckValues: room.deckValues,
      isPublicMode: room.isPublicMode,
      masterSessionId: room.masterSessionId,
      state: room.state,
      participants,
      votes: isRevealed ? votes : null,
    };
  }
}
