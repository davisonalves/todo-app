# Documentacao da API

API REST para gerenciamento das tarefas do Todo app.

## Base URL

Com o Docker Compose, a API fica disponivel em:

```text
http://localhost:3000/api
```

As requisicoes com corpo devem usar `Content-Type: application/json`. As respostas com corpo sao JSON em UTF-8. Nenhum endpoint exige autenticacao.

## Modelo de tarefa

```json
{
  "id": "1",
  "title": "Estudar Node.js",
  "completed": false,
  "created_at": "2026-10-31T14:00:00.000Z"
}
```

- `id` e retornado como string pelo driver PostgreSQL para preservar a precisao do tipo `BIGINT`.
- `title` e uma string obrigatoria com ate 200 caracteres; espacos no inicio e no fim sao removidos.
- `completed` e um booleano.
- `created_at` e a data de criacao em formato ISO 8601.

## Endpoints

### Listar tarefas

```http
GET /api/tasks
```

Retorna todas as tarefas, ordenadas das mais recentes para as mais antigas.

**Resposta `200 OK`:**

```json
[
  {
    "id": "2",
    "title": "Estudar Node.js",
    "completed": false,
    "created_at": "2026-10-31T14:00:00.000Z"
  },
  {
    "id": "1",
    "title": "Ler documentacao",
    "completed": true,
    "created_at": "2026-10-30T14:00:00.000Z"
  }
]
```

Quando nao houver tarefas, retorna `200 OK` com uma lista vazia: `[]`.

### Criar tarefa

```http
POST /api/tasks
Content-Type: application/json
```

**Corpo:**

```json
{
  "title": "Estudar Node.js"
}
```

**Resposta `201 Created`:** retorna a tarefa criada, incluindo `id`, `completed` (inicialmente `false`) e `created_at`.

**Possiveis erros:**

- `400 Bad Request`: corpo JSON nao e um objeto, titulo ausente/vazio ou titulo com mais de 200 caracteres.
- `400 Bad Request`: JSON malformado.
- `413 Payload Too Large`: corpo maior que 1 MiB.
- `415 Unsupported Media Type`: `Content-Type` nao inclui `application/json`.

Exemplo de erro:

```json
{
  "error": "O titulo e obrigatorio."
}
```

### Atualizar tarefa

```http
PUT /api/tasks/{id}
Content-Type: application/json
```

O corpo substitui o titulo e o estado de conclusao da tarefa. Ambos os campos sao obrigatorios.

**Corpo:**

```json
{
  "title": "Estudar Node.js",
  "completed": true
}
```

**Resposta `200 OK`:** retorna a tarefa atualizada.

**Possiveis erros:**

- `400 Bad Request`: identificador invalido, corpo que nao e um objeto, titulo ausente/vazio ou maior que 200 caracteres, ou `completed` diferente de booleano.
- `400 Bad Request`: JSON malformado.
- `404 Not Found`: nao existe tarefa com esse identificador.
- `413 Payload Too Large`: corpo maior que 1 MiB.
- `415 Unsupported Media Type`: `Content-Type` nao inclui `application/json`.

O identificador deve ser um inteiro positivo dentro do intervalo aceito pelo PostgreSQL `BIGINT`.

### Excluir tarefa

```http
DELETE /api/tasks/{id}
```

**Resposta `204 No Content`:** tarefa removida. A resposta nao tem corpo.

**Possiveis erros:**

- `400 Bad Request`: identificador invalido.
- `404 Not Found`: nao existe tarefa com esse identificador.

## Formato das respostas de erro

Quando a requisicao nao puder ser processada, a API retorna um status HTTP de erro e um objeto JSON com a mensagem:

```json
{
  "error": "Tarefa nao encontrada."
}
```

Uma rota `/api` inexistente retorna `404 Not Found` com `{"error":"Rota nao encontrada."}`. Erros inesperados do servidor retornam `500 Internal Server Error`.

## Exemplo completo com curl

Criar uma tarefa:

```bash
curl -i http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Estudar Node.js"}'
```

Listar:

```bash
curl -i http://localhost:3000/api/tasks
```

Atualizar a tarefa de identificador `1`:

```bash
curl -i -X PUT http://localhost:3000/api/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Estudar Node.js","completed":true}'
```

Excluir:

```bash
curl -i -X DELETE http://localhost:3000/api/tasks/1
```
