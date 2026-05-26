const listElement = document.getElementById('todo-list');
const form = document.getElementById('todo-form');
const titleInput = document.getElementById('todo-title');
const statusElement = document.getElementById('status');
const template = document.getElementById('todo-template');

const state = {
  todos: []
};

function setStatus(message) {
  statusElement.textContent = message;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderTodos() {
  listElement.innerHTML = '';

  if (state.todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'status';
    empty.textContent = 'No todos yet. Add one above.';
    listElement.appendChild(empty);
    return;
  }

  for (const todo of state.todos) {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = todo.id;
    item.classList.toggle('completed', todo.completed);

    const checkbox = item.querySelector('input[type="checkbox"]');
    const title = item.querySelector('.todo-title');
    const meta = item.querySelector('.todo-meta');
    const editButton = item.querySelector('[data-action="edit"]');
    const deleteButton = item.querySelector('[data-action="delete"]');

    checkbox.checked = todo.completed;
    title.textContent = todo.title;
    meta.textContent = `Updated ${formatDate(todo.updatedAt)}`;

    checkbox.addEventListener('change', async () => {
      try {
        const updated = await request(`/api/todos/${todo.id}/toggle`, { method: 'PATCH' });
        state.todos = state.todos.map((entry) => (entry.id === todo.id ? updated : entry));
        renderTodos();
        setStatus('Todo updated.');
      } catch (error) {
        setStatus(error.message);
      }
    });

    editButton.addEventListener('click', async () => {
      const nextTitle = prompt('Edit todo', todo.title);

      if (nextTitle === null) {
        return;
      }

      const trimmed = nextTitle.trim();
      if (!trimmed) {
        setStatus('Todo title cannot be empty.');
        return;
      }

      try {
        const updated = await request(`/api/todos/${todo.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: trimmed })
        });
        state.todos = state.todos.map((entry) => (entry.id === todo.id ? updated : entry));
        renderTodos();
        setStatus('Todo renamed.');
      } catch (error) {
        setStatus(error.message);
      }
    });

    deleteButton.addEventListener('click', async () => {
      if (!confirm('Delete this todo?')) {
        return;
      }

      try {
        await request(`/api/todos/${todo.id}`, { method: 'DELETE' });
        state.todos = state.todos.filter((entry) => entry.id !== todo.id);
        renderTodos();
        setStatus('Todo deleted.');
      } catch (error) {
        setStatus(error.message);
      }
    });

    listElement.appendChild(item);
  }
}

async function loadTodos() {
  state.todos = await request('/api/todos');
  renderTodos();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    setStatus('Todo title is required.');
    return;
  }

  try {
    const created = await request('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    state.todos = [created, ...state.todos];
    renderTodos();
    form.reset();
    titleInput.focus();
    setStatus('Todo added.');
  } catch (error) {
    setStatus(error.message);
  }
});

loadTodos().catch((error) => {
  setStatus(error.message);
});
