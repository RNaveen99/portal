const express = require('express');
const debug = require('debug')('app:authRoutes');
const passport = require('passport');
const { signUpPost, signUpGet } = require('../controllers/authController')();
const { validator } = require('../controllers/helpers/validators');
const { ifSignIn, ifNotSignIn } = require('../controllers/helpers/restrictions')();

const authRouter = express.Router();

const router = () => {
  authRouter
    .route('/signUp')
    .all(ifNotSignIn)
    .get(signUpGet)
    .post(validator, signUpPost);

  authRouter
    .route('/signIn')
    .all(ifNotSignIn)
    .get((req, res) => {
      if (req.session.errors) {
        delete req.session.errors;
        delete req.session.tempUser;
      }
      res.render('signIn');
    })
    .post((req, res, next) => {
      passport.authenticate('local', {
        successRedirect: '/events',
        failureRedirect: '/auth/signin',
        failureFlash: true,
        successFlash: 'Successfully Logged In',
      })(req, res, next);
    });

  authRouter
    .route('/signOut')
    .all(ifSignIn)
    .get((req, res) => {
      req.logOut();
      // req.session.destroy();
      res.redirect('/auth/signIn');
    });

  return authRouter;
};

module.exports = router;
