const multer = require('multer');
const debug = require('debug')('app:eventController');
const fs = require('fs');
const {
  addEvent,
  findAllEvents,
  findLiveEvents,
  findEvent,
  findEventAndUpdateIsLive,
  findEventAndDelete,
  findRequestByEvent,
  findRequestsByUser,
  findRequestByEventUserAddRemove,
  updateIsAllowed,
  updateHasStarted,
  updateHasCompleted,
  findUserByEmail,
  addResponseInEvent,
  findResponsesByEvent,
  findResponseByEventUser,
  resultsOfEventAddRemove,
  findResultByEvent,
  findResultOfAllEvents,
} = require('../controllers/helpers/mongo')();

const storage1 = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads');
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`);
  },
});

const storage2 = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './public/images/events');
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`);
  }
});

const eventController = () => {
  const upload1 = multer({ storage: storage1 }).single('eventFile');
  const upload2 = multer({ storage: storage2 }).array('eventImages');

  const eventsGet = async (req, res) => {
    const { email } = req.user;
    const liveEvents = await findLiveEvents();
    const requests = await findRequestsByUser(email);
    res.render('events', { liveEvents, requests });
  };

  const eventsPost = async (req, res) => {
    const requestData = {
      eventCode: req.body.eventCode,
      eventName: req.body.eventName,
      name: req.user.name,
      email: req.user.email,
      college: req.user.college,
      isAllowed: false,
      hasStarted: false,
      hasCompleted: false,
    };
    const tempEvent = await findEvent(requestData.eventCode);
    if (tempEvent && tempEvent.isEventLive) {
      await findRequestByEventUserAddRemove(requestData, true);
    }
    res.json({ sucess: true });
  };

  const eventsManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageEvents', { allEvents });
  };

  const eventsManagePost = async (req, res) => {
    const { eventCode, type } = req.body;
    const { isEventLive, isQuizLive } = await findEvent(eventCode);
    let flag;
    let isEvent = true;
    if (type === 'event') {
      if (isEventLive) {
        flag = false;
      } else {
        flag = true;
      }
    } else {
      isEvent = false;
      if (isQuizLive) {
        flag = false;
      } else {
        flag = true;
      }
    }
    await findEventAndUpdateIsLive(eventCode, flag, isEvent);
    res.json({ success: true });
  };

  const eventsGenerateGet = (req, res) => {
    res.render('generateEvents');
  };

  const eventsGeneratePost = (req, res) => {
    upload1(req, res, (err) => {
      if (err) {
        return res.redirect('/events/generate');
      }
      (async function addEventToMongo() {
        const data = JSON.parse(fs.readFileSync(`uploads/${req.file.originalname}`, 'utf-8'));
        const result = await findEvent(data.eventCode);
        if (result) {
          await findEventAndDelete(data.eventCode);
        }
        await addEvent(data);
        res.redirect('/events/manage');
      }());
    });
  };

  const eventsImageUploadGet = async (req, res) => {
    res.render('imageUpload');
  }

  const eventsImageUploadPost = (req, res) => {
    upload2(req, res, (err) => {
      if (err) {
        return res.redirect('/events/upload');
      }
      return res.redirect('/events');
    });
  };

  const eventsRequestManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageRequest', { allEvents });
  };

  const eventsRequestManagePost = async (req, res) => {
    const { email, eventCode } = req.body;
    if (!email) {
      const requests = await findRequestByEvent(eventCode);
      res.json(requests);
    } else {
      const request = await findRequestByEventUserAddRemove({ eventCode, email }, false);
      if (request) {
        let flag = true;
        if (request.isAllowed) {
          flag = false;
        }
        await updateIsAllowed(eventCode, email, flag);
      }
      res.json();
    }
  };

  const eventRulesGet = async (req, res) => {
    const { eventCode } = req.params;
    const event = await findEvent(eventCode);
    if (event) {
      if (event.isEventLive) {
        if (event.isQuizLive) {
          const request = await findRequestByEventUserAddRemove({ eventCode, email: req.user.email }, false);
          if (request) {
            if (request.isAllowed) {
              if (!request.hasStarted) {
                const { instructions } = event;
                const { friends } = req.user;
                return res.render('eventRules', { event, instructions, friends });
              }
              req.flash('eventRulesMsg', `It seems that you have already participated in ${event.eventName}.`);
            } else {
              req.flash('eventRulesMsg', `It seems that your request to participate in ${event.eventName} is not yet approved.`);
            }
          } else {
            req.flash('eventRulesMsg', `It seems that you did not requested to participate in ${event.eventName}`);
          }
        } else {
          req.flash('eventRulesMsg', `Quiz for ${event.eventName} is not active.`)
        }
      } else {
        req.flash('eventRulesMsg', `${event.eventName} is not active.`)
      }
    } else {
      req.flash('eventRulesMsg', 'Such an event does not exists.');
    }
    res.redirect('/events');
  };

  const eventStartGet = (req, res) => {
    res.redirect('/events');
  };

  const eventStartPost = async (req, res) => {
    const { eventCode, friendEmail } = req.body;
    debug(req.body);
    const event = await findEvent(eventCode);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ eventCode, email: req.user.email }, false);
      if (request && request.isAllowed && !request.hasStarted) {
        if (friendEmail.length) {
          const friend = req.user.friends.find((ele) => ele.email === friendEmail);
          if (!friend) {
            return res.redirect('/events');
          }
        }
        const { questions } = event;
        await updateHasStarted(eventCode, req.user.email);
        return res.render('eventStart', {
          eventName: event.eventName,
          eventCode,
          timeLimit: event.timeLimit,
          friendEmail,
          questions,
        });
      }
    }
    res.redirect('/events');
  };

  const eventEndPost = async (req, res) => {debug(req.body)
    const { eventCode } = req.body;
    const event = await findEvent(eventCode);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ eventCode, email: req.user.email }, false);
      if (!(request && request.isAllowed && request.hasStarted)) {
        return res.redirect('/events');
      }
      if (request.hasCompleted) {
        req.flash('responseMsgFailure', 'You have already responded.');
        return res.redirect('/events');
      }
      const { friendEmail } = req.body;
      if (friendEmail.length) {
        const friend = req.user.friends.find((ele) => ele.email === friendEmail);
        if (!friend) {
          req.flash('responseMsgFailure', 'Your friend is not listed in your friend list.');
          return res.redirect('/events');
        }
      }
      await updateHasCompleted(eventCode, req.user.email);
      const { questions } = event;
      const numOfQuestions = questions.length;
      const userResponse = {};
      const user = {};
      user.name = req.user.name;
      user.email = req.user.email;
      user.college = req.user.college;
      user.number = req.user.number;
      if (req.body.friendEmail) {
        const friend = await findUserByEmail(req.body.friendEmail);
        user.friendName = friend.name;
        user.friendEmail = req.body.friendEmail;
        user.friendCollege = friend.college;
        user.friendNumber = friend.number;
      }
      userResponse.user = user;
      const responseStorage = [];
      let totalScore = 0;
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalNotAttempted = 0;

      for (let i = 0; i < numOfQuestions; i += 1) {
        const singleResponse = {};
        const currentQid = `ques${questions[i].qid}`;
        const userAnswer = req.body[`${currentQid}`];
        singleResponse[`${currentQid}`] = userAnswer;
        if (!userAnswer) {
          singleResponse.status = 'Not Attempted';
          singleResponse.score = questions[i].scores[2];
          totalNotAttempted++;
        } else if (userAnswer === questions[i].answer) {
          singleResponse.status = 'correct';
          singleResponse.score = questions[i].scores[0];
          totalCorrect++;
        } else {
          singleResponse.status = 'wrong';
          singleResponse.score = questions[i].scores[1];
          totalWrong++;
        }
        totalScore += singleResponse.score;
        responseStorage.push(singleResponse);
      }
      userResponse.responseStorage = responseStorage;
      userResponse.score = totalScore;
      userResponse.correct = totalCorrect;
      userResponse.wrong = totalWrong;
      userResponse.notAttempted = totalNotAttempted;
      // debug(userResponse);

      await addResponseInEvent(eventCode, userResponse);
      req.flash('responseMsgSuccess', 'Your response has been recorded successfully.');
      return res.redirect('/events');
    }
    req.flash('responseMsgFailure', `${req.body.eventName} is not accepting responses right now.`);
    res.redirect('/events');
  };

  const eventsResponseManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageResponse', { allEvents });
  };

  const eventsResponseManagePost = async (req, res) => {
    const { eventCode } = req.body;
    const results = await findResultByEvent(eventCode);
    let responses = await findResponsesByEvent(eventCode);
    responses = responses.map((ele) => ({
      user: ele.user,
      score: ele.score,
    }));
    res.json({ responses, results });
  };

  const eventsResponseViewGet = async (req, res) => {
    const { eventCode, email } = req.query;
    const { eventName, questions } = await findEvent(eventCode);
    const response = await findResponseByEventUser(eventCode, email);
    res.render('eventResponseView', { eventName, questions, response });
  };

  const eventsResultsGet = async (req, res) => {
    const result = await findResultOfAllEvents();
    res.render('eventResults', { result });
  };

  const eventsResultsPost = async (req, res) => {
    const { eventCode, eventName, name, college } = req.body;
    await resultsOfEventAddRemove(eventCode, eventName, name, college);
    res.json({ success: true });
  };

  return {
    eventsGet,
    eventsPost,
    eventsManageGet,
    eventsManagePost,
    eventsGenerateGet,
    eventsGeneratePost,
    eventsImageUploadGet,
    eventsImageUploadPost,
    eventsRequestManageGet,
    eventsRequestManagePost,
    eventRulesGet,
    eventStartGet,
    eventStartPost,
    eventEndPost,
    eventsResponseManageGet,
    eventsResponseManagePost,
    eventsResponseViewGet,
    eventsResultsGet,
    eventsResultsPost,
  };
};

module.exports = eventController;
