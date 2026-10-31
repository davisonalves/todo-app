const fs = require('node:fs/promises');
const path = require('node:path');

const publicDirectory = path.join(__dirname, '..', 'public');
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]
]);
const MAX_BODY_SIZE = 1024 * 1024;

function createApp(taskController) {
  return require('node:http').createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApi(request, response, url.pathname, taskController);
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
  });
}

async function handleApi(request, response, pathname, controller) {
  let result;
  if (pathname === '/api/tasks' && request.method === 'GET') {
    result = await controller.list();
  } else if (pathname === '/api/tasks' && request.method === 'POST') {
    result = await controller.create(await readJsonBody(request));
  } else {
    const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (taskMatch && request.method === 'PUT') {
      result = await controller.update(taskMatch[1], await readJsonBody(request));
    } else if (taskMatch && request.method === 'DELETE') {
      result = await controller.remove(taskMatch[1]);
    } else {
      result = { status: 404, body: { error: 'Rota nao encontrada.' } };
    }
  }

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

async function readJsonBody(request) {
  if (!request.headers['content-type']?.includes('application/json')) {
    throw new HttpError(415, 'O conteudo deve ser enviado como JSON.');
  }

  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
      throw new HttpError(413, 'O corpo da requisicao excede o limite permitido.');
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, 'JSON invalido.');
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(body === null ? '' : JSON.stringify(body));
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { createApp };
