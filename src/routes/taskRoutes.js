const { readJsonBody } = require('../common/request');

function createTaskRoutes(controllers) {
  const routes = [
    {
      path: /^\/api\/tasks$/,
      methods: new Map([
        ['GET', () => controllers.getTasks.handle()],
        ['POST', async (request) =>
          controllers.createTask.handle(await readJsonBody(request))]
      ])
    },
    {
      path: /^\/api\/tasks\/(\d+)$/,
      methods: new Map([
        ['PUT', async (request, [id]) =>
          controllers.updateTask.handle(id, await readJsonBody(request))],
        ['DELETE', (_, [id]) => controllers.deleteTask.handle(id)]
      ])
    }
  ];

  return async (request, pathname) => {
    const route = routes.find(({ path }) => path.test(pathname));
    const params = route?.path.exec(pathname)?.slice(1) ?? [];
    const handler = route?.methods.get(request.method);

    if (!handler) {
      return { status: 404, body: { error: 'Rota nao encontrada.' } };
    }

    return handler(request, params);
  };
}

module.exports = { createTaskRoutes };
