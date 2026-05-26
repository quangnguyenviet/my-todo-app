const express = require('express');
const path = require('path');
const { createTodoStore } = require('./src/todoStore');

const app = express();
const port = 3001;
const store = createTodoStore(path.join(__dirname, 'data', 'todos.json'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/todos', async (_req, res, next) => {
  try {
    res.json(await store.list());
  } catch (error) {
    next(error);
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const todo = await store.create(title);
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

app.put('/api/todos/:id', async (req, res, next) => {
  try {
    const updates = {};

    if (typeof req.body?.title === 'string') {
      updates.title = req.body.title.trim();
      if (!updates.title) {
        return res.status(400).json({ error: 'Title is required.' });
      }
    }

    if (typeof req.body?.completed === 'boolean') {
      updates.completed = req.body.completed;
    }

    const todo = await store.update(req.params.id, updates);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/todos/:id/toggle', async (req, res, next) => {
  try {
    const todo = await store.toggle(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const removed = await store.remove(req.params.id);

    if (!removed) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Todo app listening on http://localhost:${port}`);
});
