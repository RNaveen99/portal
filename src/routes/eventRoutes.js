const express = require('express');
const debug = require('debug')('app:eventRoutes');
const { ifSignIn, ifSignInAdmin } = require('../controllers/helpers/restrictions')();
const { findEventByName, findEventByLive, findEvents } = require('../controllers/helpers/mongo')();
const { generateEvent } = require('../controllers/eventController')();

const eventRouter = express.Router();

const router = () => {
  eventRouter
    .route('/')
    .all(ifSignIn)
    .get((req, res) => {
      (async function eventByLive() {
        const results = await findEventByLive();
        debug(results);
        res.render('events');
      }());
    });
  eventRouter
    .route('/manageEvents')
    .all(ifSignInAdmin)
    .get((req, res) => {
      (async function eventByLive() {
        const data = await findEvents();
        debug(data);
        res.render('manageEvents', { data });
      }());
    });
  eventRouter
    .route('/generateEvents')
    .all(ifSignInAdmin)
    .get((req, res, next) => {
      res.render('generateEvents');
      next();
    })
    .post(generateEvent);

  eventRouter
    .route('/generateEventsAjax')
    .all(ifSignInAdmin)
    .get((req, res) => {
      res.render('generateEvents');
    })
    .post((req, res) => {
      debug(req.body);
      (async function find() {
        const results = await findEventByName(req.body.eventName);
        debug(results);
        const data = { success: true };
        if (results) {
          data.success = false;
        }
        res.jsonp(data);
      }());
    });

  return eventRouter;
};

module.exports = router;
