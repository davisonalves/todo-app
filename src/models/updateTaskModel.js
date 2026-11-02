class UpdateTaskModel {
  constructor(pool) {
    this.pool = pool;
  }

  async execute(id, { title, completed }) {
    const result = await this.pool.query(
      `UPDATE tasks
       SET title = $1, completed = $2
       WHERE id = $3
       RETURNING id, title, completed, created_at`,
      [title, completed, id]
    );
    return result.rows[0] || null;
  }
}

module.exports = UpdateTaskModel;
