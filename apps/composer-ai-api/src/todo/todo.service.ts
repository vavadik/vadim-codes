import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TodoDto, CreateTodoDto, UpdateTodoDto } from '@vadim-codes/composer-ai-contracts';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TodoDto[]> {
    const todos = await this.prisma.db.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return todos.map(this.toDto);
  }

  async create(dto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.prisma.db.todo.create({ data: dto });
    return this.toDto(todo);
  }

  async update(id: string, dto: UpdateTodoDto): Promise<TodoDto> {
    const existing = await this.prisma.db.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    const todo = await this.prisma.db.todo.update({ where: { id }, data: dto });
    return this.toDto(todo);
  }

  async remove(id: string): Promise<TodoDto> {
    const existing = await this.prisma.db.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    const todo = await this.prisma.db.todo.delete({ where: { id } });
    return this.toDto(todo);
  }

  private toDto(todo: {
    id: string;
    title: string;
    done: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TodoDto {
    return {
      id: todo.id,
      title: todo.title,
      done: todo.done,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }
}
