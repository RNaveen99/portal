const debug = require('debug')('app:appRoutes');
const authRouter = require('../routes/authRoutes')();
const eventRouter = require('../routes/eventRoutes')();
const friendRouter = require('../routes/friendRoutes')();
const userRouter = require('../routes/userRoutes')();
const resetPasswordRouter = require('../routes/resetPasswordRoutes')();

const appRoutes = (app) => {
  app.use('/auth', authRouter);
  app.use('/events', eventRouter);
  app.use('/teams', friendRouter);
  app.use('/findUsers', userRouter);
  app.use('/resetPassword', resetPasswordRouter);
  app.get('/', (req, res) => {
    res.redirect('/events');
  });
};

module.exports = appRoutes;