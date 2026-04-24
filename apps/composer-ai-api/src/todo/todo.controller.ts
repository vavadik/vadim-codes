import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@vadim-codes/contracts';
import { TodoService } from './todo.service';

@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @TsRestHandler(contract.todo.list)
  list() {
    return tsRestHandler(contract.todo.list, async () => {
      const todos = await this.todoService.findAll();
      return { status: 200 as const, body: todos };
    });
  }

  @TsRestHandler(contract.todo.create)
  create() {
    return tsRestHandler(contract.todo.create, async ({ body }) => {
      const todo = await this.todoService.create(body);
      return { status: 201 as const, body: todo };
    });
  }

  @TsRestHandler(contract.todo.update)
  update() {
    return tsRestHandler(contract.todo.update, async ({ params, body }) => {
      const todo = await this.todoService.update(params.id, body);
      return { status: 200 as const, body: todo };
    });
  }

  @TsRestHandler(contract.todo.remove)
  remove() {
    return tsRestHandler(contract.todo.remove, async ({ params }) => {
      const todo = await this.todoService.remove(params.id);
      return { status: 200 as const, body: todo };
    });
  }
}
