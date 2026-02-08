import { Router } from 'express';

// Middleware
import { addDemoHeaders } from '../middleware/demo/headers.js';

// Page controllers
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';

// Catalog controllers
import { catalogPage, courseDetailPage } from './catalog/catalog.js';

// Faculty controllers
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

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
