const debug = require('debug')('app:authController');
const { validationResult } = require('express-validator');
const { addUser } = require('./helpers/mongo')();

const authController = () => {
  const signUpGet = (req, res) => {
    if (!req.session.errors) {
      const errorData = {
        name: null,
        college: null,
        number: null,
        email: null,
        password: null,
      };
      const userData = {
        name: null,
        college: null,
        number: null,
        email: null,
        password: null,
        privileges: 'user',
      };
      req.session.errors = errorData;
      req.session.tempUser = userData;
    }
    res.render('signUp', { errorData: req.session.errors, tempUser: req.session.tempUser });
  };
  const signUpPost = (req, res) => {
    req.session.tempUser.name = req.body.name;
    req.session.tempUser.college = req.body.college;
    req.session.tempUser.number = req.body.number;
    req.session.tempUser.email = req.body.email;
    req.session.tempUser.password = req.body.password;
    req.session.tempUser.friends = [];

    const { errors } = validationResult(req);
    if (errors.length > 0) {
      const nameError = errors.find((ele) => {
        if (ele.param === 'name') {
          req.session.errors.name = ele.msg;
        }
        return ele.param === 'name';
      });
      if (!nameError) {
        req.session.errors.name = null;
      }

      const collegeError = errors.find((ele) => {
        if (ele.param === 'college') {
          req.session.errors.college = ele.msg;
        }
        return ele.param === 'college';
      });
      if (!collegeError) {
        req.session.errors.college = null;
      }

      const numberError = errors.find((ele) => {
        if (ele.param === 'number') {
          req.session.errors.number = ele.msg;
        }
        return ele.param === 'number';
      });
      if (!numberError) {
        req.session.errors.number = null;
      }

      const emailError = errors.find((ele) => {
        if (ele.param === 'email') {
          req.session.errors.email = ele.msg;
        }
        return ele.param === 'email';
      });
      if (!emailError) {
        req.session.errors.email = null;
      }

      const passwordError = errors.find((ele) => {
        if (ele.param === 'password') {
          req.session.errors.password = ele.msg;
        }
        return ele.param === 'password';
      });
      if (!passwordError) {
        req.session.errors.password = null;
      }

      res.redirect('/auth/signUp');
    } else {
      addUser(req, res, req.session.tempUser);
      delete req.session.errors;
      delete req.session.tempUser;
    }
  };
  return {
    signUpGet,
    signUpPost,
  };
};

module.exports = authController;
