const MAX_TITLE_LENGTH = 200;

class TaskController {
  constructor(taskModel) {
    this.taskModel = taskModel;
  }

  async list() {
    return { status: 200, body: await this.taskModel.findAll() };
  }

  async create(body) {
    if (!isObjectBody(body)) {
      return { status: 400, body: { error: 'O corpo da requisicao deve ser um objeto JSON.' } };
    }

    const title = normalizeTitle(body.title);
    if (!title) {
      return { status: 400, body: { error: 'O titulo e obrigatorio.' } };
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return { status: 400, body: { error: 'O titulo deve ter no maximo 200 caracteres.' } };
    }

    return { status: 200, body: await this.taskModel.create(title) };
  }

  async update(id, body) {
    if (!isValidId(id)) {
      return { status: 400, body: { error: 'Identificador de tarefa invalido.' } };
    }
    if (!isObjectBody(body)) {
      return { status: 400, body: { error: 'O corpo da requisicao deve ser um objeto JSON.' } };
    }

    const title = normalizeTitle(body.title);
    if (!title) {
      return { status: 400, body: { error: 'O titulo e obrigatorio.' } };
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return { status: 400, body: { error: 'O titulo deve ter no maximo 200 caracteres.' } };
    }
    if (typeof body.completed !== 'boolean') {
      return { status: 400, body: { error: 'O campo completed deve ser booleano.' } };
    }

    const task = await this.taskModel.update(id, {
      title,
      completed: body.completed
    });
    if (!task) {
      return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
    }
    return { status: 200, body: task };
  }

  async remove(id) {
    if (!isValidId(id)) {
      return { status: 400, body: { error: 'Identificador de tarefa invalido.' } };
    }
    if (!(await this.taskModel.delete(id))) {
      return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
    }
    return { status: 204, body: null };
  }
}

function normalizeTitle(title) {
  return typeof title === 'string' ? title.trim() : '';
}

function isValidId(id) {
  return id.length <= 19 && /^\d+$/.test(id) && BigInt(id) > 0n &&
    BigInt(id) <= 9223372036854775807n;
}

function isObjectBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

module.exports = TaskController;
