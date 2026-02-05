// server.js

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Global template variables middleware (before routes)
app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Me' });
});

app.get('/products', (req, res) => {
  res.render('products', { title: 'Our Products' });
});

// Live reload WebSocket server (dev only)
if (NODE_ENV.includes('dev')) {
  try {
    const ws = await import('ws');
    const wsPort = parseInt(PORT, 10) + 1;

    const wsServer = new ws.WebSocketServer({ port: wsPort });

    wsServer.on('listening', () => {
      console.log(`WebSocket server is running on port ${wsPort}`);
    });

    wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }
}

// Test route for 500 errors
app.get('/test-error', (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent || res.finished) return next(err);

  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack
  };

  try {
    res.status(status).render(`errors/${template}`, context);
  } catch {
    if (!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
