class GetTasksService {
  constructor(model) {
    this.model = model;
  }

  execute() {
    return this.model.execute();
  }
}

module.exports = GetTasksService;
