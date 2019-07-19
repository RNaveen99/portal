const passport = require('passport');
const debug = require('debug')('app:passport');
require('./strategies/local.strategy')();

module.exports = function passportConfig(app) {
  debug('inside passport');
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
