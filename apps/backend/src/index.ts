import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import auth from './routes/auth.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/api/auth', auth)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Start server
const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port)
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
