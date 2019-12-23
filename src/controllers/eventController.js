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
      res.json({ success: true });
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
                const { instructions, teamSizeMin, teamSizeMax } = event;
                const { friends } = req.user;
                return res.render('eventRules', { event, instructions, friends, teamSizeMin, teamSizeMax });
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
    const { eventCode } = req.body;
    let { teamMemberEmails } = req.body;
    if (!teamMemberEmails) {
      teamMemberEmails = [];
    }
    const event = await findEvent(eventCode);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ eventCode, email: req.user.email }, false);
      if (request && request.isAllowed && !request.hasStarted) {
        const { questions } = event;
        await updateHasStarted(eventCode, req.user.email);
        return res.render('eventStart', {
          eventName: event.eventName,
          eventCode,
          timeLimit: event.timeLimit,
          teamMemberEmails,
          questions,
        });
      }
    }
    res.redirect('/events');
  };

  const eventEndPost = async (req, res) => {
    const { eventCode, teamMemberEmails } = req.body;
    const event = await findEvent(eventCode);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ eventCode, email: req.user.email }, false);
      if (!(request && request.isAllowed && request.hasStarted)) {
        return res.redirect('/events');
      }
      if (request.hasCompleted) {
        req.flash('responseMsgFailure', 'You have already responded. Response will not be recorded again.');
        return res.redirect('/events');
      }
      await updateHasCompleted(eventCode, req.user.email);
      const { questions } = event;
      const numOfQuestions = questions.length;
      const userResponse = {};
      const user = {
        name: req.user.name,
        email: req.user.email,
        college: req.user.college,
        number: req.user.number,
      };

      if (teamMemberEmails) {
        user.teamMembers = [];
        teamMemberEmails.forEach((teamMemberEmail) => {
          req.user.friends.find((friend) => {
            if (friend.email === teamMemberEmail) {
              user.teamMembers.push({
                name: friend.name,
                email: friend.email,
                college: friend.college,
                number: friend.number,
              });
              return true;
            }
          });
        });
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
          totalNotAttempted += 1;
        } else if (userAnswer === questions[i].answer) {
          singleResponse.status = 'correct';
          singleResponse.score = questions[i].scores[0];
          totalCorrect += 1;
        } else {
          singleResponse.status = 'wrong';
          singleResponse.score = questions[i].scores[1];
          totalWrong += 1;
        }
        totalScore += singleResponse.score;
        responseStorage.push(singleResponse);
      }
      userResponse.responseStorage = responseStorage;
      userResponse.score = totalScore;
      userResponse.correct = totalCorrect;
      userResponse.wrong = totalWrong;
      userResponse.notAttempted = totalNotAttempted;

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
    const { prelimsResults, finalsResults } = await findResultOfAllEvents();
    res.render('eventResults', { prelimsResults, finalsResults });
  };

  const eventsResultsPost = async (req, res) => {
    const { eventCode, eventName, user, resultType } = req.body;
    const userObj = {
      name: user.name,
      email: user.email,
      college: user.college,
    };
    if (user.teamMembers) {
      userObj.teamMembers = user.teamMembers.map((ele) => {
        const obj = {
          name: ele.name,
          college: ele.college,
        }
        return obj;
      });
    }
    await resultsOfEventAddRemove(eventCode, eventName, userObj, resultType);
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
