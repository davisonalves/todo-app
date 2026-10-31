const { Pool } = require('pg');
const { createApp } = require('./src/app');
const TaskModel = require('./src/models/taskModel');
const TaskController = require('./src/controllers/taskController');

async function start() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  const taskModel = new TaskModel(pool);

  try {
    await taskModel.initialize();
  } catch (error) {
    console.error('Nao foi possivel conectar ou preparar o banco de dados:', error);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const app = createApp(new TaskController(taskModel));
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Todo app rodando na porta ${port}`);
  });

  server.on('close', () => {
    pool.end().catch((error) => {
      console.error('Erro ao encerrar conexao com o banco de dados:', error);
    });
  });
}

if (require.main === module) {
  start();
}

module.exports = { start };
