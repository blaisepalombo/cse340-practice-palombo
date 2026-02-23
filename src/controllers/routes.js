import { Router } from 'express';

// Middleware
import { addDemoHeaders } from '../middleware/demo/headers.js';

// Page controllers
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';

// Catalog controllers
import { catalogPage, courseDetailPage } from './catalog/catalog.js';

// Faculty controllers
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

// Contact routes
import contactRoutes from './forms/contact.js';

// Registration routes
import registrationRoutes from './forms/registration.js';

const router = Router();

/* ================================
   Router-level middleware (ASSETS)
   Must be BEFORE route definitions
   ================================ */

// Add catalog-specific styles to all catalog routes
router.use('/catalog', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
  next();
});

// Add faculty-specific styles to all faculty routes
router.use('/faculty', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
  next();
});

// Add contact-specific styles to all contact routes
router.use('/contact', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
  next();
});

// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
  next();
});

/* ================================
   Mounted feature routes
   ================================ */

// Contact form routes (mounts GET /, POST /, GET /responses)
router.use('/contact', contactRoutes);

// Registration routes (mounts GET /, POST /, GET /list)
router.use('/register', registrationRoutes);

/* ================================
   Route definitions
   ================================ */

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes (slug-based)
router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

// Faculty directory routes (slug-based)
router.get('/faculty', facultyListPage);
router.get('/faculty/:slugId', facultyDetailPage);

// Demo page with route-specific middleware
router.get('/demo', addDemoHeaders, demoPage);

// Test error route
router.get('/test-error', testErrorPage);

export default router;