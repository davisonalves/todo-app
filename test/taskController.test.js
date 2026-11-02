const test = require('node:test');
const assert = require('node:assert/strict');
const GetTasksController = require('../src/controllers/getTasksController');
const CreateTaskController = require('../src/controllers/createTaskController');
const UpdateTaskController = require('../src/controllers/updateTaskController');
const DeleteTaskController = require('../src/controllers/deleteTaskController');

function createService(overrides = {}) {
  return {
    execute: async () => [],
    ...overrides
  };
}

test('lista tarefas', async () => {
  const tasks = [{ id: '1', title: 'Estudar', completed: false }];
  const controller = new GetTasksController(createService({
    execute: async () => tasks
  }));

  assert.deepEqual(await controller.handle(), { status: 200, body: tasks });
});

test('cria tarefa com titulo normalizado', async () => {
  const controller = new CreateTaskController(createService({
    execute: async (title) => ({ id: '1', title, completed: false })
  }));

  assert.deepEqual(await controller.handle({ title: '  Estudar  ' }), {
    status: 201,
    body: { id: '1', title: 'Estudar', completed: false }
  });
});

test('rejeita titulo vazio e titulo longo demais', async () => {
  const controller = new CreateTaskController(createService());

  assert.equal((await controller.handle({ title: '   ' })).status, 400);
  assert.equal((await controller.handle({ title: 'a'.repeat(201) })).status, 400);
  assert.equal((await controller.handle(null)).status, 400);
});

test('atualiza tarefa quando os dados sao validos', async () => {
  const controller = new UpdateTaskController(createService({
    execute: async (id, task) => ({ id, ...task })
  }));

  assert.deepEqual(await controller.handle('4', {
    title: 'Revisar',
    completed: true
  }), {
    status: 200,
    body: { id: '4', title: 'Revisar', completed: true }
  });
});

test('valida identificador e campos ao atualizar', async () => {
  const controller = new UpdateTaskController(createService());

  assert.equal((await controller.handle('0', {
    title: 'Tarefa',
    completed: false
  })).status, 400);
  assert.equal((await controller.handle('1', {
    title: 'Tarefa',
    completed: 'false'
  })).status, 400);
  assert.equal((await controller.handle('1', null)).status, 400);
});

test('retorna 404 quando a tarefa nao existe', async () => {
  const updateController = new UpdateTaskController(createService({
    execute: async () => null
  }));
  const deleteController = new DeleteTaskController(createService({
    execute: async () => false
  }));

  assert.equal((await updateController.handle('1', {
    title: 'Tarefa',
    completed: false
  })).status, 404);
  assert.equal((await deleteController.handle('1')).status, 404);
});

test('remove tarefa existente', async () => {
  const controller = new DeleteTaskController(createService({
    execute: async () => true
  }));

  assert.deepEqual(await controller.handle('1'), { status: 204, body: null });
});
