import express from 'express'
import { randomUUID } from 'crypto'
import db from './db.js'

const app = express()
app.use(express.json())

function getUserId(req, res) {
  const userId = req.headers['x-user-id']
  if (!userId) {
    res.status(400).json({ error: 'Missing x-user-id header' })
    return null
  }
  return userId
}

app.get('/todos', (req, res) => {
  const userId = getUserId(req, res)
  if (!userId) return

  const todos = db
    .prepare('SELECT id, text, completed FROM todos WHERE user_id = ? ORDER BY created_at ASC')
    .all(userId)

  res.json(todos.map(t => ({ ...t, completed: Boolean(t.completed) })))
})

app.post('/todos', (req, res) => {
  const userId = getUserId(req, res)
  if (!userId) return

  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'Text is required' })

  const id = randomUUID()
  db.prepare('INSERT INTO todos (id, user_id, text, completed, created_at) VALUES (?, ?, ?, 0, ?)').run(
    id,
    userId,
    text.trim(),
    Date.now()
  )

  res.status(201).json({ id, text: text.trim(), completed: false })
})

app.patch('/todos/:id', (req, res) => {
  const userId = getUserId(req, res)
  if (!userId) return

  const { id } = req.params
  const { completed } = req.body

  const result = db
    .prepare('UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?')
    .run(completed ? 1 : 0, id, userId)

  if (result.changes === 0) return res.status(404).json({ error: 'Todo not found' })

  const todo = db.prepare('SELECT id, text, completed FROM todos WHERE id = ?').get(id)
  res.json({ ...todo, completed: Boolean(todo.completed) })
})

app.delete('/todos/:id', (req, res) => {
  const userId = getUserId(req, res)
  if (!userId) return

  const { id } = req.params
  const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(id, userId)

  if (result.changes === 0) return res.status(404).json({ error: 'Todo not found' })

  res.status(204).send()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
