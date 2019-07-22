const express = require('express');
const debug = require('debug')('app:eventRoutes');
const { ifSignIn, ifSignInAdmin } = require('../controllers/helpers/restrictions')();
const {
  eventsGet,
  eventsPost,
  eventsManageGet,
  eventsManagePost,
  eventsGenerateGet,
  eventsGeneratePost,
  eventsRequestManageGet,
  eventsRequestManagePost,
  eventRulesGet,
  eventStartGet,
} = require('../controllers/eventController')();

const eventRouter = express.Router();

const router = () => {
  eventRouter
    .route('/')
    .all(ifSignIn)
    .get(eventsGet)
    .post(eventsPost);

  eventRouter
    .route('/manage')
    .all(ifSignInAdmin)
    .get(eventsManageGet)
    .post(eventsManagePost);

  eventRouter
    .route('/generate')
    .all(ifSignInAdmin)
    .get(eventsGenerateGet)
    .post(eventsGeneratePost);

  eventRouter
    .route('/requests')
    .all(ifSignInAdmin)
    .get(eventsRequestManageGet)
    .post(eventsRequestManagePost);

  eventRouter
    .route('/:id')
    .all(ifSignIn)
    .get(eventRulesGet);

  eventRouter
    .route('/:id/start')
    .all(ifSignIn)
    .get(eventStartGet);

  return eventRouter;
};

module.exports = router;
