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
    debug(req.body.event);
    const { event } = req.body;
    const { name, email, college, number } = req.user;
    const data = { event, name, email, college, number };
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
      if (result.isLive) {
        flag1 = false;
      } else {
        flag1 = true;
      }
    } else {
      flag2 = false;
      if (result.allowQuiz) {
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

  return {
    eventsGet,
    eventsPost,
    eventsManageGet,
    eventsManagePost,
    eventsGenerateGet,
    eventsGeneratePost,
  };
};

module.exports = eventController;
