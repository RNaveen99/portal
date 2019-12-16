const { body } = require('express-validator');
const { findUserByEmail } = require('./mongo')();

module.exports.validator = [
  body('name')
    .trim()
    .not().isEmpty().withMessage('Name cannnot be empty')
    .matches(/^([A-Za-z])([A-Za-z ]){0,28}([A-Za-z])$/).withMessage('Only Alphabets with min 2 & max 30 characters and spaces in-between (if any).'),
  body('college')
    .trim()
    .not().isEmpty().withMessage('College name cannnot be empty')
    .matches(/^([A-Za-z])([A-Za-z ]){0,68}([A-Za-z])$/).withMessage('Only Alphabets with min 2 & max 70 characters and spaces in-between (if any).'),
  body('number')
    .trim()  
    .not().isEmpty().withMessage('Number cannot be empty')
    .matches(/^(\d{10})$/).withMessage('Enter a proper 10-digit mobile number.'),
  body('email')
    .trim()
    .not().isEmpty().withMessage('Email cannnot be empty')  
    .isEmail().withMessage('Enter a proper email')
    .custom(async (value) => {
      const user = await findUserByEmail(value);
      if (user != null) {
        return Promise.reject('Email already in use');
      }
    }),
  body('password')
    .not().isEmpty().withMessage('Password cannot be empty')
    .not().matches(/ /).withMessage('spaces not allowed in password')
    .isLength({ min:5 }).withMessage('Minimum length should be 5'),
];
