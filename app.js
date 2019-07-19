const express = require('express');
const debug = require('debug')('app');
const appConfiguration = require('./src/config/appConfiguration');
const appRoutes = require('./src/config/appRoutes');

const port = process.env.PORT;
const app = express();
app.listen(port, () => {
  debug(`Listening at port ${port}`);
});
appConfiguration(app);
appRoutes(app);