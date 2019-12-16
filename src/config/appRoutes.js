const debug = require('debug')('app:appRoutes');
const authRouter = require('../routes/authRoutes')();
const eventRouter = require('../routes/eventRoutes')();
const friendRouter = require('../routes/friendRoutes')();
const userRouter = require('../routes/userRoutes')();

const appRoutes = (app) => {
  app.use('/auth', authRouter);
  app.use('/events', eventRouter);
  app.use('/friends', friendRouter);
  app.use('/findUsers', userRouter);
  app.get('/', (req, res) => {
    res.redirect('/events');
  });
};

module.exports = appRoutes;