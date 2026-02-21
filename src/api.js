function getUserId() {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('userId', userId)
  }
  return userId
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getUserId(),
  }
}

export async function fetchTodos() {
  const res = await fetch('/todos', { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

export async function createTodo(text) {
  const res = await fetch('/todos', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Failed to create todo')
  return res.json()
}

export async function toggleTodo(id, completed) {
  const res = await fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ completed }),
  })
  if (!res.ok) throw new Error('Failed to update todo')
  return res.json()
}

export async function deleteTodo(id) {
  const res = await fetch(`/todos/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to delete todo')
}
