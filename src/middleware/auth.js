const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.isLoggedIn = true;
    next();
  } else {
    res.redirect('/login');
  }
};

export { requireLogin };