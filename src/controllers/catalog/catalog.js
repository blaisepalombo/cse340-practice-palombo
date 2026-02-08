import { getAllCourses, getCourseBySlug } from '../../models/catalog/courses.js';
import { getSectionsByCourseSlug } from '../../models/catalog/catalog.js';

// Route handler for the course catalog list page
const catalogPage = async (req, res, next) => {
  try {
    const courses = await getAllCourses();

    res.render('catalog/list', {
      title: 'Course Catalog',
      courses
    });
  } catch (err) {
    return next(err);
  }
};

// Route handler for individual course detail pages (slug-based)
const courseDetailPage = async (req, res, next) => {
  try {
    const courseSlug = req.params.slugId;

    // Fetch course by slug
    const course = await getCourseBySlug(courseSlug);

    // Model returns {} when not found
    if (Object.keys(course).length === 0) {
      const err = new Error(`Course ${courseSlug} not found`);
      err.status = 404;
      return next(err);
    }

    // Sorting handled by PostgreSQL
    const sortBy = req.query.sort || 'time';
    const sections = await getSectionsByCourseSlug(courseSlug, sortBy);

    res.render('catalog/detail', {
      title: `${course.courseCode} - ${course.name}`,
      course,
      sections,
      currentSort: sortBy
    });
  } catch (err) {
    return next(err);
  }
};

export { catalogPage, courseDetailPage };
