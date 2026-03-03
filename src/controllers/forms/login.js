import { body, validationResult } from 'express-validator';
import { findUserByEmail, findUserByIdWithRole, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
];

const showLoginForm = (req, res) => {
  res.render('forms/login/form', { title: 'User Login' });
};

const processLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/login');
  }

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    console.log("USER FROM DB:", user);

    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    const passwordIsValid = await verifyPassword(password, user.password);
    if (!passwordIsValid) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Remove password before storing in session
    delete user.password;

    // Ensure roleName is present (belt + suspenders)
    const freshUser = await findUserByIdWithRole(user.id);
    if (!freshUser) {
      req.flash('error', 'Login failed. User record not found.');
      return res.redirect('/login');
    }

    // Regenerate session to prevent fixation + avoid stale session objects
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.user = freshUser;

    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    req.flash('success', `Welcome, ${freshUser.name || 'there'}!`);
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Unable to log you in right now. Please try again later.');
    return res.redirect('/login');
  }
};

const processLogout = (req, res) => {
  if (!req.session) return res.redirect('/');

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.clearCookie('connect.sid');
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};

const showDashboard = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    // Safety: requireLogin should guarantee this, but avoid crashes
    if (!sessionUser) return res.redirect('/login');

    // Always refresh so roleName is never missing
    const freshUser = await findUserByIdWithRole(sessionUser.id);

    if (freshUser) {
      req.session.user = freshUser;
      await new Promise((resolve) => req.session.save(() => resolve()));
    }

    return res.render('dashboard', {
      title: 'Dashboard',
      user: freshUser || sessionUser,
      sessionData: req.session,
    });
  } catch (err) {
    console.error('Dashboard load error:', err);
    return res.render('dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      sessionData: req.session,
    });
  }
};

router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };