const passport = require('passport');
const { Strategy } = require('passport-local');
const debug = require('debug')('app:local.strategy');
const { findUserByEmail } = require('../../controllers/helpers/mongo')();

module.exports = function localStrategy() {
  passport.use(
    new Strategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      (username, password, done) => {
        (async function mongo() {
          const user = await findUserByEmail(username);
          if (user) {
            if (user.password === password) {
              return done(null, user);
            }
            return done(null, false, { message: 'Password Incorrect' });
          }
          return done(null, false, { message: 'Email not registered' });
        }());
      },
    ),
  );
};
