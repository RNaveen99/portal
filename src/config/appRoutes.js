const debug = require('debug')('app:appRoutes');
const authRouter = require('../routes/authRoutes')();
const eventRouter = require('../routes/eventRoutes')();
const friendRouter = require('../routes/friendRoutes')();

const appRoutes = (app) => {
  app.use('/auth', authRouter);
  app.use('/events', eventRouter);
  app.use('/friends', friendRouter);
  app.get('/', (req, res) => {
    res.redirect('/events');
  });
  app.get('/ajax', (req, res) => {
    const temp = { name: 'pawan' };
    res.jsonp(temp);
  });
};

module.exports = appRoutes;