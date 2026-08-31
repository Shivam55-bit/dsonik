const { body, validationResult } = require('express-validator');

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  exports.handleValidation
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  exports.handleValidation
];

exports.productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').optional().isNumeric().withMessage('Price must be a valid number'),
  exports.handleValidation
];

exports.categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  exports.handleValidation
];

exports.inquiryRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  exports.handleValidation
];
