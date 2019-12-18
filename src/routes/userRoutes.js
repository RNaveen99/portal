const express = require('express');
const debug = require('debug')('app:userRoutes');
const { ifSignInAdmin } = require('../controllers/helpers/restrictions')();
const { findUserByEmail, findRequestByUser, findResponseByEventUser } = require('../controllers/helpers/mongo')();

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
      let allResponses = [];
      if (user) {
        let allRequests = await findRequestByUser(email);
        allRequests = allRequests.map((ele) => {
          const obj = {
            eventCode: ele.eventCode,
            eventName: ele.eventName,
          };
          return obj;
        });
        for (let i = 0; i < allRequests.length; i += 1) {
          allResponses.push(findResponseByEventUser(`${allRequests[i].eventCode}`, email).then((response) => {
            if (response) {
              delete response.responseStorage;
              delete response._id;
              response.eventCode = allRequests[i].eventCode;
              response.eventName = allRequests[i].eventName;
            }
            return response;
          }));
        }
        allResponses = await Promise.all(allResponses);
        allResponses = allResponses.filter((ele) => {
          if (ele) {
            return true;
          }
          return false;
        });
      }
      res.render('findUsers', { user, email, allResponses });
    });

  return userRouter;
};

module.exports = router;
