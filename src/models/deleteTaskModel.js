class DeleteTaskModel {
  constructor(pool) {
    this.pool = pool;
  }

  async execute(id) {
    const result = await this.pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = DeleteTaskModel;
