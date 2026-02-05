// server.js

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Important variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();
const PORT = process.env.PORT || 3000;

// Course data - place this before routes
const courses = {
  CS121: {
    id: 'CS121',
    title: 'Introduction to Programming',
    description:
      'Learn programming fundamentals using JavaScript and basic web development concepts.',
    credits: 3,
    sections: [
      { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
      { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
      { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
    ]
  },
  MATH110: {
    id: 'MATH110',
    title: 'College Algebra',
    description:
      'Fundamental algebraic concepts including functions, graphing, and problem solving.',
    credits: 4,
    sections: [
      { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
      { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
      { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
    ]
  },
  ENG101: {
    id: 'ENG101',
    title: 'Academic Writing',
    description: 'Develop writing skills for academic and professional communication.',
    credits: 3,
    sections: [
      { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
      { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
      { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
    ]
  }
};

// Setup Express server
const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Configure Express middleware
 */

// 1) Log incoming requests
app.use((req, res, next) => {
  // Skip logging for routes that start with /. (like /.well-known/)
  if (!req.path.startsWith('/.')) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// 2) Make NODE_ENV available to all templates
app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV || 'production';
  next();
});

// 3) Add current year for copyright
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  next();
});

// 4) Time-based greeting
app.use((req, res, next) => {
  const currentHour = new Date().getHours();

  let message = '';
  if (currentHour < 12) message = 'Good morning';
  else if (currentHour < 18) message = 'Good afternoon';
  else message = 'Good evening';

  // Store a paragraph tag so it can be injected into the header
  res.locals.greeting = `<p>${message}!</p>`;
  next();
});

// 5) Random theme selection
app.use((req, res, next) => {
  const themes = ['blue-theme', 'green-theme', 'red-theme'];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  res.locals.bodyClass = randomTheme;
  next();
});

// 6) Share query parameters with templates
app.use((req, res, next) => {
  res.locals.queryParams = req.query || {};
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Route-specific middleware that sets custom headers (demo page only)
const addDemoHeaders = (req, res, next) => {
  res.setHeader('X-Demo-Page', 'true');
  res.setHeader('X-Middleware-Demo', 'Route-specific middleware is working');
  next();
};

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

// Course catalog list page
app.get('/catalog', (req, res) => {
  res.render('catalog', {
    title: 'Course Catalog',
    courses
  });
});

// Course detail page with route + query parameter sorting
app.get('/catalog/:courseId', (req, res, next) => {
  const courseId = req.params.courseId;
  const course = courses[courseId];

  if (!course) {
    const err = new Error(`Course ${courseId} not found`);
    err.status = 404;
    return next(err);
  }

  const sortBy = req.query.sort || 'time';
  let sortedSections = [...course.sections];

  switch (sortBy) {
    case 'professor':
      sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
      break;
    case 'room':
      sortedSections.sort((a, b) => a.room.localeCompare(b.room));
      break;
    case 'time':
    default:
      break;
  }

  console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

  res.render('course-detail', {
    title: `${course.id} - ${course.title}`,
    course: { ...course, sections: sortedSections },
    currentSort: sortBy
  });
});

// Demo page route with header middleware
app.get('/demo', addDemoHeaders, (req, res) => {
  res.render('demo', { title: 'Middleware Demo Page' });
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
