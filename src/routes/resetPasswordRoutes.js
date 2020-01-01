const express = require('express');
const debug = require('debug')('app:friendRoutes');
const { ifSignInAdmin } = require('../controllers/helpers/restrictions')();
const { updatePassword } = require('../controllers/helpers/mongo')();
const bcrypt = require('bcrypt');

const resetPasswordRouter = express.Router();

const router = () => {
  resetPasswordRouter
    .route('/')
    .all(ifSignInAdmin)
    .get((req, res) => {
      res.render('resetPassword');
    })
    .post((req, res) => {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.redirect('/resetPassword');
        }
        updatePassword(req.body.email, hash);
        res.redirect('/events');
      });
    });

  return resetPasswordRouter;
};

module.exports = router;
