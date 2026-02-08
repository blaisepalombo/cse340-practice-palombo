import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

// Faculty directory list page (supports query param sorting)
const facultyListPage = async (req, res, next) => {
  try {
    const sortBy = req.query.sort || 'name';
    const faculty = await getSortedFaculty(sortBy);

    res.render('faculty/list', {
      title: 'Faculty Directory',
      faculty,
      currentSort: sortBy
    });
  } catch (err) {
    return next(err);
  }
};

// Faculty detail page (slug-based lookup + 404 handling)
const facultyDetailPage = async (req, res, next) => {
  try {
    const facultySlug = req.params.slugId;
    const facultyMember = await getFacultyBySlug(facultySlug);

    // Model returns {} when not found
    if (Object.keys(facultyMember).length === 0) {
      const err = new Error(`Faculty member ${facultySlug} not found`);
      err.status = 404;
      return next(err);
    }

    res.render('faculty/detail', {
      title: facultyMember.name,
      facultyMember
    });
  } catch (err) {
    return next(err);
  }
};

export { facultyListPage, facultyDetailPage };
