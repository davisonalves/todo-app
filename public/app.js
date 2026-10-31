const taskForm = document.querySelector('#task-form');
const taskTitleInput = document.querySelector('#task-title');
const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Nao foi possivel concluir a operacao.');
  }
  return response.status === 204 ? null : response.json();
}

async function loadTasks() {
  try {
    const tasks = await request('/api/tasks');
    renderTasks(tasks);
    showMessage('');
  } catch (error) {
    showMessage(error.message);
  }
}

function renderTasks(tasks) {
  taskList.replaceChildren(...tasks.map(createTaskElement));
  const pendingCount = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${pendingCount} ${pendingCount === 1 ? 'pendente' : 'pendentes'}`;
  emptyState.hidden = tasks.length > 0;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = `task-item${task.completed ? ' completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Marcar "${task.title}" como concluida`);
  checkbox.addEventListener('change', () => updateTask(task, { completed: checkbox.checked }));

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Excluir "${task.title}"`);
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  item.append(checkbox, title, deleteButton);
  return item;
}

async function updateTask(task, changes) {
  try {
    await request(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: task.title, completed: changes.completed })
    });
    await loadTasks();
  } catch (error) {
    showMessage(error.message);
    await loadTasks();
  }
}

async function deleteTask(id) {
  try {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
    await loadTasks();
  } catch (error) {
    showMessage(error.message);
  }
}

function showMessage(text) {
  message.textContent = text;
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) {
    taskTitleInput.focus();
    return;
  }

  try {
    await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    taskTitleInput.value = '';
    showMessage('');
    await loadTasks();
    taskTitleInput.focus();
  } catch (error) {
    showMessage(error.message);
  }
});

loadTasks();
