class GetTasksController {
  constructor(service) {
    this.service = service;
  }

  async handle() {
    return { status: 200, body: await this.service.execute() };
  }
}

module.exports = GetTasksController;
