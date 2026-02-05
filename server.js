// server.js

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Important variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();
const PORT = process.env.PORT || 3000;

// Setup Express server
const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Global template variables middleware (MUST be before routes)
app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
app.get('/', (req, res) => {
  const title = 'Welcome Home';
  res.render('home', { title });
});

app.get('/about', (req, res) => {
  const title = 'About Me';
  res.render('about', { title });
});

app.get('/products', (req, res) => {
  const title = 'Our Products';
  res.render('products', { title });
});

// When in development mode, start a WebSocket server for live reloading
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
