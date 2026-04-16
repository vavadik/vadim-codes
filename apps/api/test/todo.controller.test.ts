import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TodoController } from 'src/todo/todo.controller';
import { TodoService } from 'src/todo/todo.service';

const now = new Date('2024-01-01T00:00:00.000Z').toISOString();

const makeTodoDto = (overrides = {}) => ({
  id: 'todo-1',
  title: 'Test todo',
  done: false,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

describe('TodoController', () => {
  let controller: TodoController;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: service }],
    }).compile();

    controller = module.get(TodoController);
  });

  describe('list', () => {
    it('returns 200 with all todos', async () => {
      const todos = [makeTodoDto({ id: 'a' }), makeTodoDto({ id: 'b' })];
      service.findAll.mockResolvedValue(todos);

      const handler = controller.list();
      const result = await handler({ headers: {} } as any);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({ status: 200, body: todos });
    });

    it('returns 200 with empty array when no todos', async () => {
      service.findAll.mockResolvedValue([]);

      const handler = controller.list();
      const result = await handler({ headers: {} } as any);

      expect(result).toEqual({ status: 200, body: [] });
    });
  });

  describe('create', () => {
    it('returns 201 with the created todo', async () => {
      const dto = { title: 'New todo' };
      const todo = makeTodoDto({ title: 'New todo' });
      service.create.mockResolvedValue(todo);

      const handler = controller.create();
      const result = await handler({ body: dto, headers: {} } as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 201, body: todo });
    });
  });

  describe('update', () => {
    it('returns 200 with the updated todo', async () => {
      const dto = { title: 'Updated', done: true };
      const todo = makeTodoDto({ title: 'Updated', done: true });
      service.update.mockResolvedValue(todo);

      const handler = controller.update();
      const result = await handler({ params: { id: 'todo-1' }, body: dto, headers: {} } as any);

      expect(service.update).toHaveBeenCalledWith('todo-1', dto);
      expect(result).toEqual({ status: 200, body: todo });
    });

    it('propagates NotFoundException when todo is not found', async () => {
      service.update.mockRejectedValue(new NotFoundException('Todo missing-id not found'));

      const handler = controller.update();

      await expect(
        handler({ params: { id: 'missing-id' }, body: {}, headers: {} } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('returns 200 with the deleted todo', async () => {
      const todo = makeTodoDto();
      service.remove.mockResolvedValue(todo);

      const handler = controller.remove();
      const result = await handler({ params: { id: 'todo-1' }, headers: {} } as any);

      expect(service.remove).toHaveBeenCalledWith('todo-1');
      expect(result).toEqual({ status: 200, body: todo });
    });

    it('propagates NotFoundException when todo is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Todo missing-id not found'));

      const handler = controller.remove();

      await expect(handler({ params: { id: 'missing-id' }, headers: {} } as any)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
