const fs = require('node:fs/promises');
const path = require('node:path');
const { HttpError } = require('./common/request');
const { createTaskRoutes } = require('./routes/taskRoutes');

const publicDirectory = path.join(__dirname, '..', 'public');
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]
]);
function createApp(taskControllers) {
  const taskRoutes = createTaskRoutes(taskControllers);
  return require('node:http').createServer((request, response) =>
    handleRequest(request, response, taskRoutes)
  );
}

async function handleRequest(request, response, taskRoutes) {
  const url = new URL(request.url, 'http://localhost');

  try {
    if (url.pathname.startsWith('/api/')) {
      const result = await taskRoutes(request, url.pathname);
      sendResult(response, result);
      return;
    }

    await serveStatic(request, response, url.pathname);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.status, { error: error.message });
      return;
    }

    console.error('Erro ao processar requisicao:', error);
    sendJson(response, 500, { error: 'Erro interno do servidor.' });
  }
}

function sendResult(response, result) {
  if (result.status === 204) {
    response.writeHead(204);
    response.end();
    return;
  }
  sendJson(response, result.status, result.body);
}

async function serveStatic(request, response, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  const file = staticFiles.get(pathname);
  if (!file) {
    sendJson(response, 404, { error: 'Pagina nao encontrada.' });
    return;
  }

  const [filename, contentType] = file;
  const contents = await fs.readFile(path.join(publicDirectory, filename));
  response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': contents.length
  });
  response.end(request.method === 'HEAD' ? undefined : contents);
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(body === null ? '' : JSON.stringify(body));
}

module.exports = { createApp };
