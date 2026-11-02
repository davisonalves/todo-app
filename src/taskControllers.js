const GetTasksModel = require('./models/getTasksModel');
const GetTasksService = require('./services/getTasksService');
const GetTasksController = require('./controllers/getTasksController');
const CreateTaskModel = require('./models/createTaskModel');
const CreateTaskService = require('./services/createTaskService');
const CreateTaskController = require('./controllers/createTaskController');
const UpdateTaskModel = require('./models/updateTaskModel');
const UpdateTaskService = require('./services/updateTaskService');
const UpdateTaskController = require('./controllers/updateTaskController');
const DeleteTaskModel = require('./models/deleteTaskModel');
const DeleteTaskService = require('./services/deleteTaskService');
const DeleteTaskController = require('./controllers/deleteTaskController');

function createTaskControllers(pool) {
  return {
    getTasks: new GetTasksController(new GetTasksService(new GetTasksModel(pool))),
    createTask: new CreateTaskController(
      new CreateTaskService(new CreateTaskModel(pool))
    ),
    updateTask: new UpdateTaskController(
      new UpdateTaskService(new UpdateTaskModel(pool))
    ),
    deleteTask: new DeleteTaskController(
      new DeleteTaskService(new DeleteTaskModel(pool))
    )
  };
}

module.exports = { createTaskControllers };
