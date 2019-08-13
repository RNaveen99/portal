const express = require('express');
const path = require('path');
const debug = require('debug')('app:appConfiguration');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const flash = require('connect-flash');
const passportFunction = require('./passport.js');

const client = redis.createClient();

const appConfiguration = (app) => {
  app.use(morgan('dev'));
  app.use(
    session({
      secret: 'webPortal',
      store: new RedisStore({
        host: 'localhost',
        port: process.env.REDIS_PORT,
        client,
        ttl: 3600,
      }),
      saveUninitialized: false,
      resave: false,
    }),
  );
  passportFunction(app);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(flash());
  app.set('view engine', 'ejs');
  app.set('views', './src/views');
  app.use(express.static('public'));
  app.use(express.static('node_modules/materialize-css/dist/'));
  app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.responseMsg = req.flash('responseMsg');

    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.privileges = false;
    if (res.locals.isAuthenticated && req.user.privileges === 'admin') {
      res.locals.privileges = true;
    }
    next();
  });
};

module.exports = appConfiguration;
