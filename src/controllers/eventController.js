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
  findRequestInEventAddRemove,
  updateIsAllowed,
  updateHasStarted,
  updateHasCompleted,
  findUserByEmail,
  findResponseInEventAddRemove,
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
    const data = await findEventByLive();
    debug(data);
    const { user } = req;
    res.render('events', { data, user });
  };

  const eventsPost = async (req, res) => {
    debug('events Post');
    const { event } = req.body;
    const { name, email, college } = req.user;
    const data = {
      event,
      name,
      email,
      college,
    };
    const result = await findRequestInEventAddRemove(data, true);
  };

  const eventsManageGet = async (req, res) => {
    const data = await findAllEvents();
    res.render('manageEvents', { data });
    // debug(data);
  };
  const eventsManagePost = async (req, res) => {
    debug('events Manage Post');
    debug(req.body.event);
    debug(req.body);
    const { event, type } = req.body;
    let result = await findEventByName(event);
    let flag1;
    let flag2 = true;
    if (type === 'event') {
      if (result.isEventLive) {
        flag1 = false;
      } else {
        flag1 = true;
      }
    } else {
      flag2 = false;
      if (result.isQuizLive) {
        flag1 = false;
      } else {
        flag1 = true;
      }
    }
    result = await findEventByNameAndUpdateIsLive(event, flag1, flag2);
    // debug(result);
  };
  const eventsGenerateGet = (req, res) => {
    res.render('generateEvents');
  };

  const eventsGeneratePost = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.end('Error uploading file');
      }
      debug(req.file);
      (async function addEventToMongo() {
        const data = JSON.parse(fs.readFileSync(`uploads/${req.file.originalname}`, 'utf-8'));
        let result = await findEventByName(data.event);
        if (result) {
          result = await findEventByNameAndDelete(data.event);
        }
        await addEvent(data);
      }());

      res.redirect('/events');
    });
  };

  const eventsRequestManageGet = async (req, res) => {
    debug('Manage Requests ');
    const data = await findAllEvents();
    res.render('manageRequest', { data });
  };

  const eventsRequestManagePost = async (req, res) => {
    debug('Manage Request POst');
    const data = {};
    data.email = req.body.email;
    data.event = req.body.event;
    debug(req.body);
    debug(data);
    if (!data.email) {
      let { requests } = await findEventByName(data.event);
      requests = requests.map(ele => ({
        name: ele.name,
        email: ele.email,
        college: ele.college,
        isAllowed: ele.isAllowed,
      }));
      debug(requests);
      res.json(requests);
    } else {
      debug('-----------------------');
      const result = await findRequestInEventAddRemove(data, false);
      if (result) {
        let { requests } = result;
        requests = requests.find(ele => data.email === ele.email);
        let flag = true;
        if (requests.isAllowed) {
          flag = false;
        }
        await updateIsAllowed(data, flag);
        debug('==========Request Found=========');
        debug(requests);

        // debug(result);
      } else {
        debug('======request not found==========');
      }
    }
  };

  const eventRulesGet = async (req, res) => {
    const { id } = req.params;
    const event = await findEventByName(id);
    if (event && event.isEventLive) {
      debug('==============');
      const { instructions } = event;
      const { friends } = req.user;
      res.render('eventRules', { event, instructions, friends });
    } else {
      debug('--------------');
      res.redirect('/events');
    }
  };

  const eventStartGet = (req, res) => {
    res.redirect('/events');
  };
  const eventStartPost = async (req, res) => {
    let { event } = req.body;
    const { friendEmail } = req.body;
    debug(req.body);
    event = await findEventByName(event);
    let { requests } = event;
    requests = requests.find(ele => ele.email === req.user.email);
    debug('==============');
    debug(requests);
    debug('==============');
    if (
      event.isEventLive
      && event.isQuizLive
      && requests
      && requests.isAllowed
      && !requests.hasStarted
    ) {
      debug('==============');
      const { questions } = event;
      res.render('eventStart', {
        eventName: event.eventName,
        event: event.event,
        time: event.timeAlloted,
        friendEmail,
        questions,
      });
      let r = await updateHasStarted({ event: event.event, email: req.user.email }, true);
      debug(r);
    } else {
      debug('--------------');
      res.redirect('/events');
    }
  };

  const eventEndPost = async (req, res) => {
    let { questions, requests } = await findEventByName(req.body.event);
    requests = requests.find(ele => ele.email === req.user.email);
    if (requests.hasCompleted) {
      return res.redirect('/events');
    }
    let r = await updateHasCompleted({ event: req.body.event, email: req.user.email }, true);
    debug(r);
    const { numOfQuestions } = req.body;
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

    await findResponseInEventAddRemove(req.body.event, userResponse);
    // res.redirect(`/`);
    res.redirect('/events');
  };

  const eventsResponseManageGet = async (req, res) => {
    debug('Manage Responses ');
    let data = await findAllEvents();
    data = data.map(ele => ({
      event: ele.event,
      eventName: ele.eventName,
    }));

    res.render('manageResponse', { data });
  };

  const eventsResponseManagePost = async (req, res) => {
    debug('Manage Responses');
    let { responses } = await findEventByName(req.body.event);
    responses = responses.map(ele => ({
      user: ele.user,
      score: ele.score,
      correct: ele.correct,
      wrong: ele.wrong,
      notAttempted: ele.notAttempted,
    }));
    debug(responses);
    res.json(responses);
  };

  const eventsResponseViewGet = async (req, res) => {
    const { event, email } = req.query;
    if (event) {
      let { eventName, questions, responses } = await findEventByName(event);
      responses = responses.find(ele => email === ele.user.email);
      debug(responses);
      debug(questions);
      debug(event);
      debug(req.query);
      res.render('eventResponseView', { eventName, questions, responses });
    }

    else res.end('Nothing');
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
  };
};

module.exports = eventController;
