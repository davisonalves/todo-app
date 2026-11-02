const { Pool } = require('pg');
const { createApp } = require('./src/app');
const initializeDatabase = require('./src/common/initializeDatabase');
const { createTaskControllers } = require('./src/taskControllers');

async function start() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await initializeDatabase(pool);
  } catch (error) {
    console.error('Nao foi possivel conectar ou preparar o banco de dados:', error);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const app = createApp(createTaskControllers(pool));
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
