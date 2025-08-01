import { cors } from 'hono/cors'
import {exit} from 'process'
import startServer from './utils/server.js'
import apiRouter from './api.js'


startServer((app) => {
  app.get('/health', (c) => c.text('OK'));

  app.use('/api/*', cors())
  app.route('/api', apiRouter)

}).catch((err) => {
  console.error('Failed to start server:', err);
  exit(1);
});

