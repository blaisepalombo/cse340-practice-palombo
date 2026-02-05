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

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);

// Faculty directory routes
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Demo page with route-specific middleware
router.get('/demo', addDemoHeaders, demoPage);

// Test error route
router.get('/test-error', testErrorPage);

export default router;
