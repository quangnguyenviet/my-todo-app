# my-todo-app

Simple Todo application with:

- Node.js + Express REST API on port `3001`
- Vanilla HTML/CSS/JavaScript frontend
- JSON file storage in `data/todos.json`

## Features

- Create todos
- Edit todo titles
- Mark todos complete/incomplete
- Delete todos

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open the app:

   - Frontend: `http://localhost:3001`
   - API: `http://localhost:3001/api/todos`

## Project structure

- `server.js` - Express server and API routes
- `src/todoStore.js` - JSON-file persistence layer
- `public/` - Static frontend assets
- `data/todos.json` - Stored todo items
