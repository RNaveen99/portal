const multer = require('multer');
const debug = require('debug')('app:eventController');
const fs = require('fs');
const { addEvent } = require('../controllers/helpers/mongo')();

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
  const generateEvent = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.end('Error uploading file');
      }
      //  rest of the code
      debug(req.file);
      (async function addEventToMongo() {
        const data = fs.readFileSync(`uploads/${req.file.originalname}`, 'utf-8');
        await addEvent(data);
      }());
      
      res.redirect('/events');
    })
  };
  return {
    generateEvent,
  };
};

module.exports = eventController;
