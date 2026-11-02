class GetTasksModel {
  constructor(pool) {
    this.pool = pool;
  }

  async execute() {
    const result = await this.pool.query(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC, id DESC'
    );
    return result.rows;
  }
}

module.exports = GetTasksModel;
