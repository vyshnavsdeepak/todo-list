import { useState, useEffect } from 'react'
import TodoInput from './components/TodoInput.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoList from './components/TodoList.jsx'
import * as api from './api.js'

function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.fetchTodos()
      .then(setTodos)
      .catch(() => setError('Failed to load todos'))
      .finally(() => setLoading(false))
  }, [])

  async function addTodo(text) {
    try {
      const todo = await api.createTodo(text)
      setTodos(prev => [...prev, todo])
    } catch {
      setError('Failed to add todo')
    }
  }

  async function deleteTodo(id) {
    try {
      await api.deleteTodo(id)
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch {
      setError('Failed to delete todo')
    }
  }

  async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id)
    try {
      const updated = await api.toggleTodo(id, !todo.completed)
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
    } catch {
      setError('Failed to update todo')
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  return (
    <div className="app">
      <h1>Todo List</h1>
      <div className="card">
        <TodoInput onAdd={addTodo} />
        <FilterBar filter={filter} setFilter={setFilter} />
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </div>
  )
}

export default App
