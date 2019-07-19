const { MongoClient } = require('mongodb');
const debug = require('debug')('app:mongoHelper');

const mongo = () => {
  const url = 'mongodb://localhost:27017';
  const dbName = 'portal';

  const createConnection = async () => {
    debug('request for connection sent');
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    debug('request for connection accepted');
    return { client, db };
  };
  
  const addUser = async (req, res, userAccount) => {
    let c;
    try {
      const { client, db } = await createConnection();
      c = client;
      debug('Connected correctly to server');
      const col = await db.collection('users');
      const results = await col.insertOne(userAccount);
      // debug(results);
      req.logIn(results.ops[0], () => {
        res.redirect('/events');
      });
    } catch (error) {
      debug(error);
    }
    c.close();
  };
  
  const findUserByEmail = async (email) => {
    let c; let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('users');
      results = await col.findOne({ email });
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  }

  const findEventByName = async (event) => {
    let c; let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.findOne({ eventName: event });
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  }

  const addEvent = async (data) => {
    let c; let results;
    try {
      const { client, db} = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.insertOne(JSON.parse(data));
    } catch (error) {
      debug(error);
    }
    c.close();
  }

  const findEventByLive = async () => {
    let c; let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.find({ isLive: true }, {eventName:1, questions: 0, requests: 0, responses: 0 }).toArray();
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  }
  const findEvents = async () => {
    let c; let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.find({ }, {eventName:1, questions: 0, requests: 0, responses: 0 }).toArray();
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  }
  return {
    createConnection,
    addUser,
    findUserByEmail,
    findEventByName,
    addEvent,
    findEventByLive,
    findEvents,
  };
};

module.exports = mongo;