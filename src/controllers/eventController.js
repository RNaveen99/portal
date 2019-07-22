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
      res.render('eventRules', { event, instructions });
    } else {
      debug('--------------');
      res.redirect('/events');
    }
  };

  const eventStartGet = async (req, res) => {
    const { id } = req.params;
    const event = await findEventByName(id);
    let requests;
    if (event) {
      requests = event.requests;
      requests = requests.find(ele => ele.email === req.user.email);
    }
    debug('==============');
    debug(requests);
    debug('==============');
    if (event && event.isEventLive && event.isQuizLive && requests && requests.isAllowed && !requests.hasStarted) {
      debug('==============');
      const { questions } = event;
      res.render('eventStart', { eventName: event.eventName, event: event.event, time: event.timeAlloted, questions });
    } else {
      debug('--------------');
      res.redirect('/events');
    }
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
  };
};

module.exports = eventController;
