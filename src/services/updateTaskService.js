class UpdateTaskService {
  constructor(model) {
    this.model = model;
  }

  execute(id, task) {
    return this.model.execute(id, task);
  }
}

module.exports = UpdateTaskService;
