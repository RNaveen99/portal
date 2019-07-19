const debug = require('debug')('app:appRoutes');
const authRouter = require('../routes/authRoutes')();
const eventRouter = require('../routes/eventRoutes')();

const appRoutes = (app) => {
  app.use('/auth', authRouter);
  app.use('/events', eventRouter);
  app.get('/', (req, res) => {
    res.render('home');
  });
  app.get('/ajax', (req, res) => {
    const temp = { name: 'pawan' };
    res.jsonp(temp);
  });
};

module.exports = appRoutes;