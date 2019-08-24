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
    const liveEvents = await findEventByLive();
    const requests = await findRequestByUser(email);
    res.render('events', { liveEvents, requests });
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
    await findRequestByEventUserAddRemove(requestData, true);
    res.json({ sucess: true });
  };
  
  const eventsManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageEvents', { allEvents });
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
    await findEventByNameAndUpdateIsLive(event, flag1, flag2);
    res.json({ success: true });
  };
  
  const eventsGenerateGet = (req, res) => {
    res.render('generateEvents');
  };

  const eventsGeneratePost = (req, res) => {
    upload1(req, res, (err) => {
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
  
  const eventsImageUploadGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('imageUpload', { allEvents });
  }

  const eventsImageUploadPost = (req, res) => {
    upload2(req, res, (err) => {
      if (err) {
        return res.end('Error uploading Images');
      }
      return res.redirect('/events');
    });
  };

  const eventsRequestManageGet = async (req, res) => {
    const allEvents = await findAllEvents();
    res.render('manageRequest', { allEvents });
  };

  const eventsRequestManagePost = async (req, res) => {
    const data = {};
    data.email = req.body.email;
    data.event = req.body.event;
    if (!data.email) {
      const requests = await findRequestByEvent(data.event);
      res.json(requests);
    } else {
      const request = await findRequestByEventUserAddRemove(data, false);
      if (request) {
        let flag = true;
        if (request.isAllowed) {
          flag = false;
        }
        await updateIsAllowed(data, flag);
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
        if (friendEmail.length) {
          const friend = req.user.friends.find((ele) => ele.email === friendEmail);
          if (!friend) {
            return res.redirect('/events');
          }
        }
        const { questions } = event;
        await updateHasStarted({ event: event.event, email: req.user.email });
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
    let { event } = req.body;
    event = await findEventByName(event);
    if (event && event.isEventLive && event.isQuizLive) {
      const { questions } = event;
      const request = await findRequestByEventUserAddRemove({ event: event.event, email: req.user.email }, false);
      if (request.hasCompleted) {
        req.flash('responseMsg', 'You have already responded.');
        return res.redirect('/events');
      }
      const { friendEmail } = req.body;
      if (friendEmail.length) {
        const friend = req.user.friends.find((ele) => ele.email === friendEmail);
        if (!friend) {
          return res.redirect('/events');
        }
      }
      await updateHasCompleted({ event: req.body.event, email: req.user.email });
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

      for (let i = 0; i < numOfQuestions; i++) {
        const data = {};
        const currentQid = `ques${questions[i].qid}`;
        const userAnswer = req.body[`${currentQid}`];
        data[`${currentQid}`] = userAnswer;
        if (!userAnswer) {
          data.status = 'Not Attempted';
          data.score = questions[i].scores[2];
          totalNotAttempted++;
        } else if (userAnswer === questions[i].answer) {
          data.status = 'correct';
          data.score = questions[i].scores[0];
          totalCorrect++;
        } else {
          data.status = 'wrong';
          data.score = questions[i].scores[1];
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
    const data = await findAllEvents();
    res.render('manageResponse', { data });
  };

  const eventsResponseManagePost = async (req, res) => {
    const { event } = req.body;
    const { results } = await findEventByName(event);
    let responses = await findResponseByEvent(`${event}`);
    responses = responses.map((ele) => ({
      user: ele.user,
      score: ele.score,
    }));
    res.json({ responses, results });
  };

  const eventsResponseViewGet = async (req, res) => {
    const { event, email } = req.query;
    const { eventName, questions } = await findEventByName(event);
    const response = await findResponseByEventUser(event, email);
    res.render('eventResponseView', { eventName, questions, response });
  };

  const eventsResultsGet = async (req, res) => {
    let result = await findAllEvents();
    result = result.map((ele) => ({
      eventName: ele.eventName,
      results: ele.results,
    }));
    res.render('eventResults', { result });
  };

  const eventsResultsPost = async (req, res) => {
    const { event, name, college } = req.body;
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
