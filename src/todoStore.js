const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

function createTodoStore(filePath) {
  async function ensureFile() {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '[]\n', 'utf8');
    }
  }

  async function readTodos() {
    await ensureFile();
    const raw = await fs.readFile(filePath, 'utf8');
    const todos = JSON.parse(raw || '[]');

    return Array.isArray(todos) ? todos : [];
  }

  async function writeTodos(todos) {
    await ensureFile();
    await fs.writeFile(filePath, `${JSON.stringify(todos, null, 2)}\n`, 'utf8');
  }

  return {
    async list() {
      const todos = await readTodos();
      return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async create(title) {
      const todos = await readTodos();
      const todo = {
        id: randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      todos.unshift(todo);
      await writeTodos(todos);
      return todo;
    },
    async update(id, updates) {
      const todos = await readTodos();
      const index = todos.findIndex((todo) => todo.id === id);

      if (index === -1) {
        return null;
      }

      todos[index] = {
        ...todos[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await writeTodos(todos);
      return todos[index];
    },
    async toggle(id) {
      const todos = await readTodos();
      const index = todos.findIndex((todo) => todo.id === id);

      if (index === -1) {
        return null;
      }

      todos[index] = {
        ...todos[index],
        completed: !todos[index].completed,
        updatedAt: new Date().toISOString()
      };

      await writeTodos(todos);
      return todos[index];
    },
    async remove(id) {
      const todos = await readTodos();
      const nextTodos = todos.filter((todo) => todo.id !== id);

      if (nextTodos.length === todos.length) {
        return false;
      }

      await writeTodos(nextTodos);
      return true;
    }
  };
}

module.exports = { createTodoStore };
