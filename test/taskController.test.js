const test = require('node:test');
const assert = require('node:assert/strict');
const TaskController = require('../src/controllers/taskController');

function createController(overrides = {}) {
  const taskModel = {
    findAll: async () => [],
    create: async (title) => ({ id: '1', title, completed: false }),
    update: async (id, task) => ({ id, ...task }),
    delete: async () => true,
    ...overrides
  };
  return new TaskController(taskModel);
}

test('lista tarefas', async () => {
  const tasks = [{ id: '1', title: 'Estudar', completed: false }];
  const controller = createController({ findAll: async () => tasks });

  assert.deepEqual(await controller.list(), { status: 200, body: tasks });
});

test('cria tarefa com titulo normalizado', async () => {
  const controller = createController();

  assert.deepEqual(await controller.create({ title: '  Estudar  ' }), {
    status: 201,
    body: { id: '1', title: 'Estudar', completed: false }
  });
});

test('rejeita titulo vazio e titulo longo demais', async () => {
  const controller = createController();

  assert.equal((await controller.create({ title: '   ' })).status, 400);
  assert.equal((await controller.create({ title: 'a'.repeat(201) })).status, 400);
  assert.equal((await controller.create(null)).status, 400);
});

test('atualiza tarefa quando os dados sao validos', async () => {
  const controller = createController();

  assert.deepEqual(await controller.update('4', {
    title: 'Revisar',
    completed: true
  }), {
    status: 200,
    body: { id: '4', title: 'Revisar', completed: true }
  });
});

test('valida identificador e campos ao atualizar', async () => {
  const controller = createController();

  assert.equal((await controller.update('0', {
    title: 'Tarefa',
    completed: false
  })).status, 400);
  assert.equal((await controller.update('1', {
    title: 'Tarefa',
    completed: 'false'
  })).status, 400);
  assert.equal((await controller.update('1', null)).status, 400);
});

test('retorna 404 quando a tarefa nao existe', async () => {
  const controller = createController({
    update: async () => null,
    delete: async () => false
  });

  assert.equal((await controller.update('1', {
    title: 'Tarefa',
    completed: false
  })).status, 404);
  assert.equal((await controller.remove('1')).status, 404);
});

test('remove tarefa existente', async () => {
  const controller = createController();

  assert.deepEqual(await controller.remove('1'), { status: 204, body: null });
});
