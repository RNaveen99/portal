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
    req.session.errors.name = null;
    req.session.errors.college = null;
    req.session.errors.number = null;
    req.session.errors.email = null;
    req.session.errors.password = null;
    req.session.save();
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
      errors.find((ele) => {
        if (ele.param === 'name') {
          req.session.errors.name = ele.msg;
        }
      });
      errors.find((ele) => {
        if (ele.param === 'college') {
          req.session.errors.college = ele.msg;
        }
      });
      errors.find((ele) => {
        if (ele.param === 'number') {
          req.session.errors.number = ele.msg;
        }
      });
      errors.find((ele) => {
        if (ele.param === 'email') {
          req.session.errors.email = ele.msg;
        }
      });
      errors.find((ele) => {
        if (ele.param === 'password') {
          req.session.errors.password = ele.msg;
        }
      });
      res.redirect('/auth/signUp');
    } else {
      addUser(req, res, req.session.tempUser);
      delete req.session.errors;
      delete req.session.tempUser;
      req.session.save();
      debug(req.session);
    }
  };
  const signIn = () => {
    debug('signIn');
  };

  return {
    signUpGet,
    signUpPost,
    signIn,
  };
};

module.exports = authController;
