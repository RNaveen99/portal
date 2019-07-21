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
    let c;
    let results;
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
  };

  const findEventByName = async (event) => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.findOne({ event });
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const findEventByNameAndUpdateIsLive = async (event, flag1, flag2) => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      if (flag2) {
        results = await col.findOneAndUpdate({ event }, { $set: { isLive: flag1 } });
      } else {
        results = await col.findOneAndUpdate({ event }, { $set: { allowQuiz: flag1 } });
      }
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };

  const addEvent = async (data) => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.insertOne(data);
    } catch (error) {
      debug(error);
    }
    c.close();
  };

  const findEventByLive = async () => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col
        .find(
          { isLive: true },
          {
            eventName: 1,
            questions: 0,
            requests: 0,
            responses: 0,
          },
        )
        .toArray();
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const findAllEvents = async () => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col
        .find(
          {},
          {
            eventName: 1,
            questions: 0,
            requests: 0,
            responses: 0,
          },
        )
        .toArray();
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const findEventByNameAndDelete = async (event) => {
    let c;
    let result;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      result = await col.findOneAndDelete({ event });
    } catch (error) {
      debug(error);
    }
    c.close();
    debug(result);
  };
  const removeRequestInEvent = async (col, data) => {
    const result = await col.findOneAndUpdate(
      { event: data.event },
      {
        $pull: {
          requests: {
            email: data.email,
          },
        },
      },
    );
    return result;
  };
  const addRequestInEvent = async (col, data) => {
    const result = await col.findOneAndUpdate(
      { event: data.event },
      {
        $push: {
          requests: {
            name: data.name,
            email: data.email,
            college: data.college,
            number: data.number,
            isAllowed: false,
          },
        },
      },
    );
    return result;
  };
  const findRequestInEventAddRemove = async (data, flag) => {
    let c;
    let result;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      result = await col.findOne({
        event: data.event,
        'requests.email': data.email
      });
      debug('-----------result 1 starts----------');
      debug(result);
      debug('------------result 1 ends---------');
      if (flag) {
        if (result) {
          await removeRequestInEvent(col, data);
        } else {
          result = await addRequestInEvent(col, data);
        }
      }
    } catch (error) {
      debug(error);
    }
    debug('-----------result----------');
    debug(result);
    debug('---------------------');
    c.close();
    return result;
  };

  return {
    createConnection,
    addUser,
    findUserByEmail,
    findEventByName,
    findEventByNameAndUpdateIsLive,
    addEvent,
    findEventByLive,
    findAllEvents,
    findEventByNameAndDelete,
    findRequestInEventAddRemove,
  };
};

module.exports = mongo;
