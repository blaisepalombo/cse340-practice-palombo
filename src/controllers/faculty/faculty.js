// src/controllers/faculty/faculty.js

import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

// Faculty directory list page (supports query param sorting)
const facultyListPage = (req, res) => {
  const sortBy = req.query.sort || 'name';
  const faculty = getSortedFaculty(sortBy);

  res.render('faculty/list', {
    title: 'Faculty Directory',
    faculty,
    currentSort: sortBy
  });
};

// Faculty detail page (route param lookup + 404 handling)
const facultyDetailPage = (req, res, next) => {
  const facultyId = req.params.facultyId;
  const member = getFacultyById(facultyId);

  if (!member) {
    const err = new Error(`Faculty member ${facultyId} not found`);
    err.status = 404;
    return next(err);
  }

  res.render('faculty/detail', {
    title: member.name,
    faculty: { ...member, id: facultyId }
  });
};

export { facultyListPage, facultyDetailPage };
