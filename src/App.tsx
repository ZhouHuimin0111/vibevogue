import { useState, useEffect } from 'react';
import { liveQuery } from 'dexie';
import { db, type Todo } from './db';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const subscription = liveQuery(() => db.todos.toArray()).subscribe({
      next: (items) => setTodos(items),
      error: (err) => console.error(err),
    });
    return () => subscription.unsubscribe();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await db.todos.add({
      title: newTodo,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewTodo('');
  };

  const toggleTodo = async (todo: Todo) => {
    await db.todos.update(todo.id!, {
      completed: !todo.completed,
      updatedAt: new Date(),
    });
  };

  const deleteTodo = async (id: number) => {
    await db.todos.delete(id);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">VibeVogue Todos</h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id!)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-gray-500 text-center py-4">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default App;
