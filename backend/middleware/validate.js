const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// Login validation rules
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Identifier is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['student', 'staff', 'owner'])
    .withMessage('Role must be student, staff, or owner'),
  handleValidationErrors
];

// Student creation validation rules
const validateStudentCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required')
    .matches(/^[0-9A-Z]+$/)
    .withMessage('Roll number must contain only alphanumeric characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('batch')
    .isIn(['A', 'B', 'C', 'D', 'NON-CRT'])
    .withMessage('Batch must be A, B, C, D, or NON-CRT'),
  handleValidationErrors
];

// Student update validation rules
const validateStudentUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('batch')
    .optional()
    .isIn(['A', 'B', 'C', 'D', 'NON-CRT'])
    .withMessage('Batch must be A, B, C, D, or NON-CRT'),
  handleValidationErrors
];

// Avatar update validation
const validateAvatarUpdate = [
  body('avatarId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Avatar ID cannot be empty if provided'),
  body('customAvatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Custom avatar must be a valid URL'),
  handleValidationErrors
];

// Resume update validation
const validateResumeUpdate = [
  body('resumeUrl')
    .trim()
    .notEmpty()
    .withMessage('Resume URL is required')
    .isURL()
    .withMessage('Resume URL must be a valid URL'),
  handleValidationErrors
];

// Repository validation
const validateRepository = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Repository name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Repository name must be between 1 and 100 characters'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('Repository URL is required')
    .isURL()
    .withMessage('Repository URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateStudentCreate,
  validateStudentUpdate,
  validateAvatarUpdate,
  validateResumeUpdate,
  validateRepository,
  handleValidationErrors
};

