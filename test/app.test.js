const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

test('serve a interface e executa o fluxo da API de tarefas', async (t) => {
  const tasks = [];
  let nextId = 1;
  const controllers = {
    getTasks: {
      handle: async () => ({ status: 200, body: tasks })
    },
    createTask: {
      handle: async (body) => {
        const task = { id: String(nextId++), title: body.title.trim(), completed: false };
        tasks.push(task);
        return { status: 201, body: task };
      }
    },
    updateTask: {
      handle: async (id, body) => {
        const task = tasks.find((item) => item.id === id);
        if (!task) return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
        Object.assign(task, body);
        return { status: 200, body: task };
      }
    },
    deleteTask: {
      handle: async (id) => {
        const index = tasks.findIndex((item) => item.id === id);
        if (index < 0) return { status: 404, body: { error: 'Tarefa nao encontrada.' } };
        tasks.splice(index, 1);
        return { status: 204, body: null };
      }
    }
  };
  const server = createApp(controllers).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Minhas tarefas/);

  const createdResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Estudar' })
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();

  const listedResponse = await fetch(`${baseUrl}/api/tasks`);
  assert.equal((await listedResponse.json()).length, 1);

  const updatedResponse = await fetch(`${baseUrl}/api/tasks/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Estudar', completed: true })
  });
  assert.equal((await updatedResponse.json()).completed, true);

  const deletedResponse = await fetch(`${baseUrl}/api/tasks/${created.id}`, {
    method: 'DELETE'
  });
  assert.equal(deletedResponse.status, 204);
});

test('retorna erro para JSON malformado', async (t) => {
  const server = createApp({
    createTask: { handle: async () => ({ status: 200, body: null }) }
  }).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'JSON invalido.' });
});

test('retorna 404 para metodo nao registrado nas rotas da API', async (t) => {
  const server = createApp({}).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Estudar', completed: true })
  });
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Rota nao encontrada.' });
});
