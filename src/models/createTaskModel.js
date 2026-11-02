class CreateTaskModel {
  constructor(pool) {
    this.pool = pool;
  }

  async execute(title) {
    const result = await this.pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at',
      [title]
    );
    return result.rows[0];
  }
}

module.exports = CreateTaskModel;
