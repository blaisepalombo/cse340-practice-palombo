import { body, validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Validation rules for login form
 */
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
    .withMessage('Password must be between 8 and 128 characters')
];

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
  res.render('forms/login/form', {
    title: 'User Login'
  });
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash('error', error.msg);
    });
    return res.redirect('/login');
  }

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    // Prevent account enumeration: same message for all auth failures
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
    req.session.user = user;

    // Personalized success message
    const displayName = user.name || 'there';
    req.flash('success', `Welcome, ${displayName}!`);

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Unable to log you in right now. Please try again later.');
    return res.redirect('/login');
  }
};

/**
 * Handle user logout.
 */
const processLogout = (req, res) => {
  if (!req.session) {
    return res.redirect('/');
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.clearCookie('connect.sid');
      return res.redirect('/');
    }

    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
  const user = req.session.user;
  const sessionData = req.session;

  // Extra security check to ensure password is not present
  if (user && user.password) {
    console.error('Security error: password found in user object');
    delete user.password;
  }

  if (sessionData.user && sessionData.user.password) {
    console.error('Security error: password found in sessionData.user');
    delete sessionData.user.password;
  }

  res.render('dashboard', {
    title: 'Dashboard',
    user,
    sessionData
  });
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };