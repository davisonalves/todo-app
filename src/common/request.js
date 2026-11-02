const MAX_BODY_SIZE = 1024 * 1024;

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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { HttpError, readJsonBody };
