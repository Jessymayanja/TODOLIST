import { useEffect, useState } from 'react'
import './App.css'

// API root: default to Vite proxy '/api'. If VITE_API_BASE is set, use it.
const API_ROOT = ((import.meta.env.VITE_API_BASE ?? '/api')).replace(/\/$/, '')

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchTodos() {
    setLoading(true)
    try {
      const res = await fetch(`${API_ROOT}/todos/`)
      const data = await res.json()
      setTodos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await fetch(`${API_ROOT}/todos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false })
    })
    const created = await res.json()
    setTodos(prev => [created, ...prev])
    setTitle('')
  }

  async function toggleTodo(todo) {
    const res = await fetch(`${API_ROOT}/todos/${todo.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    })
    const updated = await res.json()
    setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  async function deleteTodo(id) {
    await fetch(`${API_ROOT}/todos/${id}/`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h2>Todo List</h2>
      <form onSubmit={addTodo} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add a task..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
          {todos.map(t => (
            <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <input type="checkbox" checked={t.completed} onChange={() => toggleTodo(t)} />
              <span style={{ textDecoration: t.completed ? 'line-through' : 'none', flex: 1 }}>{t.title}</span>
              <button onClick={() => deleteTodo(t.id)} aria-label={`Delete ${t.title}`}>Delete</button>
            </li>
          ))}
          {todos.length === 0 && <li>No todos yet.</li>}
        </ul>
      )}
    </div>
  )
}

export default App