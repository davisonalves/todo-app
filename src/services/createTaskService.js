class CreateTaskService {
  constructor(model) {
    this.model = model;
  }

  execute(title) {
    return this.model.execute(title);
  }
}

module.exports = CreateTaskService;
