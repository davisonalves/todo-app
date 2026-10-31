# Todo app

Aplicacao de tarefas com interface em HTML/CSS/JavaScript, servidor HTTP nativo do Node.js e PostgreSQL. O backend segue uma separacao MVC: o controller valida e coordena as operacoes, o model consulta o banco e os arquivos em `public/` compoem a view.

## Executar com Docker

Requer Docker e Docker Compose:

```bash
docker compose up --build
```

Acesse [http://localhost:3000](http://localhost:3000). O schema e criado automaticamente quando o servidor inicia. Para encerrar, use `Ctrl+C`; para remover tambem os dados persistidos, execute `docker compose down -v`.

## Executar localmente

Requer Node.js 20+ e uma instancia PostgreSQL acessivel:

```bash
npm install
DATABASE_URL=postgres://todo:todo@localhost:5432/todo npm start
```

O banco deve existir e aceitar as credenciais informadas em `DATABASE_URL`.

## Testes

Os testes unitarios usam o test runner nativo do Node.js e nao precisam de banco:

```bash
npm test
```

O GitHub Actions executa primeiro os testes unitarios e depois a suite do repositorio `davisonalves/todo-integration-tests` usando Docker Compose. Configure o secret `INTEGRATION_TESTS_REPO_TOKEN` nas configuracoes do repositorio do app com um token que tenha permissao `Contents: Read` para o repositorio de testes. O `GITHUB_TOKEN` padrao nao concede acesso a outro repositorio privado. Pull requests originados de forks nao recebem secrets; nesses casos, a etapa de checkout privado nao podera executar.

## API

Documentacao completa, com formatos de requisicao/resposta e exemplos `curl`, em [API.md](./API.md).

- `GET /api/tasks` lista tarefas.
- `POST /api/tasks` cria uma tarefa com `{ "title": "..." }`.
- `PUT /api/tasks/:id` atualiza com `{ "title": "...", "completed": false }`.
- `DELETE /api/tasks/:id` remove uma tarefa.
