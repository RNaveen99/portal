const multer = require('multer');
const debug = require('debug')('app:eventController');
const fs = require('fs');
const {
  addEvent,
  findAllEvents,
  findEventByLive,
  findEventByName,
  findEventByNameAndUpdateIsLive,
  findEventByNameAndDelete,
  findRequestByEvent,
  findRequestByUser,
  findRequestByEventUserAddRemove,
  updateIsAllowed,
  updateHasStarted,
  updateHasCompleted,
  findUserByEmail,
  addResponseInEvent,
  findResponseByEvent,
  findResponseByEventUser,
  resultsInEventAddRemove,
} = require('../controllers/helpers/mongo')();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads');
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`);
  },
});

const eventController = () => {
  const upload = multer({ storage }).single('eventFile');

  const eventsGet = async (req, res) => {
    const { email } = req.user;
    //  liveEvents is an array
    const liveEvents = await findEventByLive();
    //  requests is an array
    const requests = await findRequestByUser(email);
    res.render('events', { liveEvents, requests });
    debug('==================== Events Get start ==================');
    debug(liveEvents);
    debug('==================== Events Get end ==================');
  };

  const eventsPost = async (req, res) => {
    const requestData = {
      event: req.body.event,
      name: req.user.name,
      email: req.user.email,
      college: req.user.college,
      isAllowed: false,
      hasStarted: false,
      hasCompleted: false,
    };
    const result = await findRequestByEventUserAddRemove(requestData, true);
    debug(result);
    res.json({ sucess: true });
  };
  // ========================= Done ===========================================
  const eventsManageGet = async (req, res) => {
    // allEvents is an array
    const allEvents = await findAllEvents();
    res.render('manageEvents', { allEvents });
    debug('==================== Events Manage Get start ==================');
    debug(allEvents);
    debug('==================== Events Manage Get end ==================');
  };
  const eventsManagePost = async (req, res) => {
    const { event, type } = req.body;
    const { isEventLive, isQuizLive } = await findEventByName(event);
    let flag1;
    let flag2 = true;
    if (type === 'event') {
      if (isEventLive) {
        flag1 = false;
      } else {
        flag1 = true;
      }
    } else {
      flag2 = false;
      if (isQuizLive) {
        flag1 = false;
      } else {
        flag1 = true;
      }
    }
    const result = await findEventByNameAndUpdateIsLive(event, flag1, flag2);
    debug('==================== Events Manage Post start ==================');
    debug(req.body);
    debug(result);
    debug('==================== Events Manage Post end ==================');
    res.json({ success: true });
  };
  // ======================================================================
  // ===============================Done==================================
  const eventsGenerateGet = (req, res) => {
    res.render('generateEvents');
  };

  const eventsGeneratePost = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.end('Error uploading file');
      }
      (async function addEventToMongo() {
        const data = JSON.parse(fs.readFileSync(`uploads/${req.file.originalname}`, 'utf-8'));
        const result = await findEventByName(data.event);
        if (result) {
          await findEventByNameAndDelete(data.event);
        }
        await addEvent(data);
        res.redirect('/events/manage');
      }());
    });
  };
  // ========================================================================
  const eventsRequestManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageRequest', { allEvents });
  };

  const eventsRequestManagePost = async (req, res) => {
    const data = {};
    data.email = req.body.email;
    data.event = req.body.event;
    if (!data.email) {
      //  requests is an array
      const requests = await findRequestByEvent(data.event);
      res.json(requests);
    } else {
      // result is document
      const request = await findRequestByEventUserAddRemove(data, false);
      if (request) {
        let flag = true;
        if (request.isAllowed) {
          flag = false;
        }
        await updateIsAllowed(data, flag);
        debug('==========Request Found=========');
        debug(request);
      } else {
        debug('======request not found==========');
      }
      res.json();
    }
  };

  const eventRulesGet = async (req, res) => {
    const { id } = req.params;
    const event = await findEventByName(id);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ event: id, email: req.user.email }, false);
      if (request && request.isAllowed && !request.hasStarted) {
        const { instructions } = event;
        const { friends } = req.user;
        return res.render('eventRules', { event, instructions, friends });
      }
    }
    res.redirect('/events');
  };

  const eventStartGet = (req, res) => {
    res.redirect('/events');
  };
  const eventStartPost = async (req, res) => {
    let { event } = req.body;
    const { friendEmail } = req.body;
    debug(req.body);
    event = await findEventByName(event);
    if (event && event.isEventLive && event.isQuizLive) {
      const request = await findRequestByEventUserAddRemove({ event: event.event, email: req.user.email }, false);
      if (request && request.isAllowed && !request.hasStarted) {
        debug(friendEmail.length);
        if (friendEmail.length) {
          const friend = req.user.friends.find((ele) => ele.email === friendEmail);
          debug(friend);
          if (!friend) {
            return res.redirect('/events');
          }
        }
        const { questions } = event;
        const r = await updateHasStarted({ event: event.event, email: req.user.email });
        return res.render('eventStart', {
          eventName: event.eventName,
          event: event.event,
          time: event.timeAlloted,
          friendEmail,
          questions,
        });
      }
    }
    res.redirect('/events');
  };

  const eventEndPost = async (req, res) => {
    debug(req.body);
    let { event } = req.body;
    event = await findEventByName(event);
    if (event && event.isEventLive && event.isQuizLive) {
      const { questions } = event;
      const request = await findRequestByEventUserAddRemove({ event: event.event, email: req.user.email }, false);
      if (request.hasCompleted) {
        return res.redirect('/events');
      }
      const { friendEmail } = req.body;
      if (friendEmail.length) {
        const friend = req.user.friends.find((ele) => ele.email === friendEmail);
        debug(friend);
        if (!friend) {
          return res.redirect('/events');
        }
      }
      const r = await updateHasCompleted({ event: req.body.event, email: req.user.email }, true);
      debug(r);
      // const { numOfQuestions } = req.body;
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
      const dataArray = [];
      let totalScore = 0;
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalNotAttempted = 0;

      for (let i = 1; i <= numOfQuestions; i++) {
        const data = {};
        const userAnswer = req.body[`ques${i}`];
        data[`ques${i}`] = userAnswer;
        if (!userAnswer) {
          data.status = 'Not Attempted';
          data.score = questions[i - 1].scores[2];
          totalNotAttempted++;
        } else if (userAnswer === questions[i - 1].answer) {
          data.status = 'correct';
          data.score = questions[i - 1].scores[0];
          totalCorrect++;
        } else {
          data.status = 'wrong';
          data.score = questions[i - 1].scores[1];
          totalWrong++;
        }
        totalScore += data.score;
        dataArray.push(data);
      }
      userResponse.dataArray = dataArray;
      userResponse.score = totalScore;
      userResponse.correct = totalCorrect;
      userResponse.wrong = totalWrong;
      userResponse.notAttempted = totalNotAttempted;
      debug(userResponse);

      await addResponseInEvent(event.event, userResponse);
      res.redirect('/events');
    }
  };

  const eventsResponseManageGet = async (req, res) => {
    debug('Manage Responses ');
    const data = await findAllEvents();
    debug(data);
    res.render('manageResponse', { data });
  };

  const eventsResponseManagePost = async (req, res) => {
    debug('Manage Responses');
    const { event } = req.body;
    const { results } = await findEventByName(event);
    let responses = await findResponseByEvent(`${event}`);
    responses = responses.map((ele) => ({
      user: ele.user,
      score: ele.score,
    }));
    debug(responses);
    debug(results);
    res.json({ responses, results });
  };

  const eventsResponseViewGet = async (req, res) => {
    const { event, email } = req.query;
    let { eventName, questions } = await findEventByName(event);
    const response = await findResponseByEventUser(event, email);
    debug(response);
    debug(questions);
    debug(event);
    debug(req.query);
    res.render('eventResponseView', { eventName, questions, response });
  };

  const eventsResultsGet = async (req, res) => {
    let result = await findAllEvents();
    result = result.map((ele) => ({
      eventName: ele.eventName,
      results: ele.results,
    }));
    debug(result);
    res.render('eventResults', { result });
  };
  const eventsResultsPost = async (req, res) => {
    const { event, name, college } = req.body;
    debug(req.body);
    await resultsInEventAddRemove(event, name, college);
    res.json({ success: true });
  };
  return {
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
