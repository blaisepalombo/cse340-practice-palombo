import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

/**
 * Display the contact form page.
 */
const showContactForm = (req, res) => {
  res.render('forms/contact/form', {
    title: 'Contact Us'
  });
};

/**
 * Handle contact form submission with validation.
 */
const handleContactSubmission = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Store each validation error as a separate flash message
    errors.array().forEach((error) => {
      req.flash('error', error.msg);
    });
    return res.redirect('/contact');
  }

  const { subject, message } = req.body;

  try {
    await createContactForm(subject, message);

    // Flash success for user feedback
    req.flash('success', 'Thank you for contacting us! We will respond soon.');
    return res.redirect('/contact');
  } catch (error) {
    // Keep server logging for debugging
    console.error('Error saving contact form:', error);

    // User-friendly message
    req.flash('error', 'Unable to submit your message. Please try again later.');
    return res.redirect('/contact');
  }
};

/**
 * Display all contact form submissions.
 */
const showContactResponses = async (req, res) => {
  let contactForms = [];

  try {
    contactForms = await getAllContactForms();
  } catch (error) {
    console.error('Error retrieving contact forms:', error);
  }

  res.render('forms/contact/responses', {
    title: 'Contact Form Submissions',
    contactForms
  });
};

// GET /contact
router.get('/', showContactForm);

// POST /contact
router.post(
  '/',
  [
    body('subject')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Subject must be at least 2 characters'),
    body('message')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Message must be at least 10 characters')
  ],
  handleContactSubmission
);

// GET /contact/responses
router.get('/responses', showContactResponses);

export default router;