const { isObjectBody, normalizeTitle } = require('../common/taskValidation');

const MAX_TITLE_LENGTH = 200;

class CreateTaskController {
  constructor(service) {
    this.service = service;
  }

  async handle(body) {
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

    return { status: 201, body: await this.service.execute(title) };
  }
}

module.exports = CreateTaskController;
