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
    res.render('events', { data });
    debug(data);
  };
  const eventsManageGet = async (req, res) => {
    const data = await findAllEvents();
    res.render('manageEvents', { data });
    // debug(data);
  };
  const eventsManagePost = async (req, res) => {
    debug('events Manage Post');
    debug(req.body.eventName);
    let result = await findEventByName(req.body.eventName);
    let flag;
    if (result.isLive) {
      flag = false;
    } else {
      flag = true;
    }
    result = await findEventByNameAndUpdateIsLive(req.body.eventName, flag);
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
        let result = await findEventByName(data.eventName);
        if (result) {
          result = await findEventByNameAndDelete(data);
        }
        await addEvent(data);
      }());

      res.redirect('/events');
    });
  };

  return {
    eventsGet,
    eventsManageGet,
    eventsManagePost,
    eventsGenerateGet,
    eventsGeneratePost,
  };
};

module.exports = eventController;
