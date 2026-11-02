class DeleteTaskService {
  constructor(model) {
    this.model = model;
  }

  execute(id) {
    return this.model.execute(id);
  }
}

module.exports = DeleteTaskService;
