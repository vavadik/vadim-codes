import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoService } from 'src/todo/todo.service';
import { PrismaService } from 'src/prisma/prisma.service';

const now = new Date('2024-01-01T00:00:00.000Z');

const makePrismaTodo = (overrides = {}) => ({
  id: 'todo-1',
  title: 'Test todo',
  done: false,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const makeDto = (overrides = {}) => ({
  id: 'todo-1',
  title: 'Test todo',
  done: false,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  ...overrides,
});

describe('TodoService', () => {
  let service: TodoService;
  let prisma: { db: { todo: ReturnType<typeof makePrismaDbMock> } };

  function makePrismaDbMock() {
    return {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  }

  beforeEach(async () => {
    const todoMock = makePrismaDbMock();
    prisma = { db: { todo: todoMock } };

    const module = await Test.createTestingModule({
      providers: [TodoService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TodoService);
  });

  describe('findAll', () => {
    it('returns all todos mapped to DTOs ordered by createdAt desc', async () => {
      const records = [
        makePrismaTodo({ id: 'a', title: 'First' }),
        makePrismaTodo({ id: 'b', title: 'Second' }),
      ];
      prisma.db.todo.findMany.mockResolvedValue(records);

      const result = await service.findAll();

      expect(prisma.db.todo.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([
        makeDto({ id: 'a', title: 'First' }),
        makeDto({ id: 'b', title: 'Second' }),
      ]);
    });

    it('returns empty array when no todos exist', async () => {
      prisma.db.todo.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('creates a todo and returns the DTO', async () => {
      const dto = { title: 'New todo' };
      const record = makePrismaTodo({ title: 'New todo' });
      prisma.db.todo.create.mockResolvedValue(record);

      const result = await service.create(dto);

      expect(prisma.db.todo.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(makeDto({ title: 'New todo' }));
    });
  });

  describe('update', () => {
    it('updates and returns the DTO when todo exists', async () => {
      const existing = makePrismaTodo();
      const updated = makePrismaTodo({ title: 'Updated', done: true });
      prisma.db.todo.findUnique.mockResolvedValue(existing);
      prisma.db.todo.update.mockResolvedValue(updated);

      const dto = { title: 'Updated', done: true };
      const result = await service.update('todo-1', dto);

      expect(prisma.db.todo.findUnique).toHaveBeenCalledWith({ where: { id: 'todo-1' } });
      expect(prisma.db.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: dto,
      });
      expect(result).toEqual(makeDto({ title: 'Updated', done: true }));
    });

    it('throws NotFoundException when todo does not exist', async () => {
      prisma.db.todo.findUnique.mockResolvedValue(null);

      await expect(service.update('missing-id', { title: 'x' })).rejects.toThrow(
        new NotFoundException('Todo missing-id not found')
      );
      expect(prisma.db.todo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes and returns the DTO when todo exists', async () => {
      const existing = makePrismaTodo();
      prisma.db.todo.findUnique.mockResolvedValue(existing);
      prisma.db.todo.delete.mockResolvedValue(existing);

      const result = await service.remove('todo-1');

      expect(prisma.db.todo.findUnique).toHaveBeenCalledWith({ where: { id: 'todo-1' } });
      expect(prisma.db.todo.delete).toHaveBeenCalledWith({ where: { id: 'todo-1' } });
      expect(result).toEqual(makeDto());
    });

    it('throws NotFoundException when todo does not exist', async () => {
      prisma.db.todo.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        new NotFoundException('Todo missing-id not found')
      );
      expect(prisma.db.todo.delete).not.toHaveBeenCalled();
    });
  });
});
