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
    .route('/:id')
    .all(ifSignIn)
    .get((req, res) => {
      const {id} = req.params;
      debug(req.params);
      res.end(`${id}`);
    });
  return eventRouter;
};

module.exports = router;
