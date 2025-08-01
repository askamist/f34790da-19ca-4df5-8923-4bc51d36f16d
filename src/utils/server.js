import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import process from 'process'
import db from './db.js' // Assuming db.js is the file that exports the database instance

async function startServer(bindHook) {
  const app = new Hono()

  const port = process.env.PORT || 3000
  app.port = port // Set the port for the Hono app

  await db.load() // Ensure the database is loaded before starting the server
  app.use((c, next) => {c.set('db', db); return next();})

  bindHook(app)

  serve(app, (info) => {
    console.log(`Backend Server Listening on http://localhost:${info.port}`) // Listening on http://localhost:3000
  })
}

export default startServer;
