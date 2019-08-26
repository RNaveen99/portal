const { body } = require('express-validator');
const { findUserByEmail } = require('./mongo')();

module.exports.validator = [
  body('name')
    .not().isEmpty().withMessage('Name cannnot be empty')
    .matches(/^[a-zA-Z ]{2,30}$/).withMessage('Only Alphabets with max 30 characters.')
    .trim(),
  body('college')
    .not().isEmpty().withMessage('College name cannnot be empty')
    .matches(/^[a-zA-Z ]{2,50}$/).withMessage('Only Alphabets')
    .trim(),
  body('number')
    .not().isEmpty().withMessage('Number cannot be empty')
    .trim()
    .matches(/^(\d{10})$/).withMessage('Enter a proper 10-digit mobile number.'),
  body('email')
    .not().isEmpty().withMessage('Email cannnot be empty')
    .trim()
    .isEmail().withMessage('Enter a proper email')
    .custom(async (value) => {
      const user = await findUserByEmail(value);
      if (user != null) {
        return Promise.reject('Email already in use');
      }
    }),
  body('password')
    .not().isEmpty().withMessage('Password cannot be empty')
    .trim()
    .not().matches(/ /).withMessage('spaces not allowed in password')
    .isLength({ min:5 }).withMessage('Minimum length should be 5'),
];
