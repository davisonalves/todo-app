const { isValidId } = require('../common/taskValidation');

class DeleteTaskController {
  constructor(service) {
    this.service = service;
  }

  async handle(id) {
    if (!isValidId(id)) {
      return { status: 400, body: { error: 'Identificador de tarefa invalido.' } };
    }
    if (!(await this.service.execute(id))) {
      return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
    }
    return { status: 204, body: null };
  }
}

module.exports = DeleteTaskController;
