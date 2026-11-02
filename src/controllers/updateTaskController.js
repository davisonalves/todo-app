const {
  isObjectBody,
  isValidId,
  normalizeTitle
} = require('../common/taskValidation');

const MAX_TITLE_LENGTH = 200;

class UpdateTaskController {
  constructor(service) {
    this.service = service;
  }

  async handle(id, body) {
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

    const task = await this.service.execute(id, { title, completed: body.completed });
    if (!task) {
      return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
    }
    return { status: 200, body: task };
  }
}

module.exports = UpdateTaskController;
