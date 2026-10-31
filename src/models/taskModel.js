class TaskModel {
  constructor(pool) {
    this.pool = pool;
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async findAll() {
    const result = await this.pool.query(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at ASC, id ASC'
    );
    return result.rows;
  }

  async create(title) {
    const result = await this.pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at',
      [title]
    );
    return result.rows[0];
  }

  async update(id, { title, completed }) {
    const result = await this.pool.query(
      `UPDATE tasks
       SET title = $1, completed = $2
       WHERE id = $3
       RETURNING id, title, completed, created_at`,
      [title, completed, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = TaskModel;
