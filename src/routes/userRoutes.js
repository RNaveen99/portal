const express = require('express');
const debug = require('debug')('app:userRoutes');
const { ifSignInAdmin } = require('../controllers/helpers/restrictions')();
const { findUserByEmail, findAllEvents, findResponseByEventUser, findResult } = require('../controllers/helpers/mongo')();

const userRouter = express.Router();

const router = () => {
  userRouter
    .route('/')
    .all(ifSignInAdmin)
    .get((req, res) => {
      res.render('findUsers', { email: req.body.email });
    })
    .post(async (req, res) => {
      const { email } = req.body;
      const user = await findUserByEmail(email);
      const allResponses = [];
      if (user) {
        let allEvents = await findAllEvents();
        allEvents = allEvents.map((ele) => {
          let obj = {
            event: ele.event,
            eventName: ele.eventName,
          };
          return obj;
        });
        for (let i = 0; i < allEvents.length; i += 1) {
          const response = await findResponseByEventUser(`${allEvents[i].event}`, email);
          if (response) {
            delete response.responseStorage;
            delete response._id;
            response.event = allEvents[i].event;
            response.eventName = allEvents[i].eventName;
            allResponses.push(response);
          }
        }
      }
      res.render('findUsers', { user, email, allResponses });
    });

  return userRouter;
};

module.exports = router;
