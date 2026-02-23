// server.js
import { setupDatabase, testConnection } from './src/models/setup.js';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Session + PG store
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

// Import MVC components
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';

/**
 * Server configuration
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

/**
 * Setup Express Server
 */
const app = express();

/**
 * IMPORTANT FOR RENDER (behind proxy):
 * Allows Express to correctly detect HTTPS so secure cookies work.
 */
app.set('trust proxy', 1);

/**
 * Session middleware MUST be after app is created,
 * and before routes/middleware that rely on req.session.
 */
const pgSession = connectPgSimple(session);

app.use(
  session({
    store: new pgSession({
      conObject: {
        connectionString: process.env.DB_URL,
        // Configure SSL for session store connection (required by BYU-I databases)
        ssl: {
          ca: caCert,
          rejectUnauthorized: true,
          checkServerIdentity: () => undefined
        }
      },
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      /**
       * Use secure cookies automatically when HTTPS is detected.
       * Works correctly on Render when trust proxy is enabled.
       */
      secure: 'auto',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Start automatic session cleanup (after session config)
startSessionCleanup();

/**
 * Configure Express
 */
app.use(express.static(path.join(__dirname, 'public')));

// Allow Express to receive and process POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Global Middleware
 */
app.use(addLocalVariables);

/**
 * Routes
 */
app.use('/', routes);

/**
 * Error Handling
 */
// 404 handler
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  // Prevent infinite loops, if a response has already been sent, do nothing
  if (res.headersSent || res.finished) {
    return next(err);
  }

  // Determine status and template
  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  // Prepare data for the template
  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack,
    NODE_ENV
  };

  // Render the appropriate error template with fallback
  try {
    res.status(status).render(`errors/${template}`, context);
  } catch (renderErr) {
    // If rendering fails, send a simple error page instead
    if (!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
    }
  }
});

/**
 * Start WebSocket Server in Development Mode; used for live reloading
 */
if (NODE_ENV.includes('dev')) {
  const ws = await import('ws');

  try {
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

/**
 * Start Server
 */
app.listen(PORT, async () => {
  try {
    await setupDatabase();
    await testConnection();
  } catch (err) {
    console.error('Database setup/connection failed:', err);
  }

  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});