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

  const findUserByEmail = async email => {
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

  const findEventByName = async event => {
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
        results = await col.findOneAndUpdate({ event }, { $set: { isEventLive: flag1 } });
      } else {
        results = await col.findOneAndUpdate({ event }, { $set: { isQuizLive: flag1 } });
      }
    } catch (error) {
      debug(error);
    }
    c.close();
    return results.lastErrorObject;
  };

  const addEvent = async data => {
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
      results = await col.find({ isEventLive: true }).toArray();
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
      results = await col.find({}).toArray();
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const findEventByNameAndDelete = async event => {
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
  //  ========================= findRequestInEventAddRemove =================================
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
            isAllowed: false,
            hasStarted: false,
            hasCompleted: false,
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
        'requests.email': data.email,
      });
      debug('-----------result 1 starts----------');
      debug(result);
      debug('------------result 1 ends---------');
      if (flag) {
        if (result) {
          await removeRequestInEvent(col, data);
        } else {
          await addRequestInEvent(col, data);
        }
      }
    } catch (error) {
      debug(error);
    }
    c.close();
    return result;
  };
  // =========================================================================
  const updateIsAllowed = async (data, flag) => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.findOneAndUpdate(
        { event: data.event, 'requests.email': data.email },
        { $set: { 'requests.$.isAllowed': flag } },
      );
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const updateHasStarted = async (data, flag) => {
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      debug('======================');
      debug(data);
      debug('======================');
      const col = await db.collection('events');
      results = await col.findOneAndUpdate(
        { event: data.event, 'requests.email': data.email },
        { $set: { 'requests.$.hasStarted': flag } },
      );
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  const updateHasCompleted = async (data, flag) => {
    debug('====================================');
    debug(data);
    let c;
    let results;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      results = await col.findOneAndUpdate(
        { event: data.event, 'requests.email': data.email },
        { $set: { 'requests.$.hasCompleted': flag } },
      );
    } catch (error) {
      debug(error);
    }
    c.close();
    return results;
  };
  // ==============================================================================
  const addFriend = async (email, friend) => {
    let c;
    let result;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('users');
      result = await col.findOneAndUpdate(
        { email },
        {
          $push: {
            friends: {
              name: friend.name,
              email: friend.email,
              college: friend.college,
            },
          },
        },
      );
    } catch (error) {
      debug(error);
    }
    c.close();
    return result;
  };

  // ====================================================================
  const addResponseInEvent = async (event, data) => {
    let c;
    let result;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      result = await col.findOneAndUpdate(
        { event },
        {
          $push: {
            responses: {
              user: data.user,
              dataArray: data.dataArray,
              score: data.score,
              correct: data.correct,
              wrong: data.wrong,
              notAttempted: data.notAttempted,
            },
          },
        },
      );
    } catch (error) {
      debug(error);
    }
    c.close();
    return result;
  };
  // ====================================================================================

  const removeResultInEvent = async (col, event, name, college) => {
    const result = await col.findOneAndUpdate(
      { event },
      {
        $pull: {
          results: {
            name,
            college,
          },
        },
      },
    );
    return result;
  };
  const addResultInEvent = async (col, event, name, college) => {
    const result = await col.findOneAndUpdate(
      { event },
      {
        $push: {
          results: {
            name,
            college,
          },
        },
      },
    );
    return result;
  };
  const resultsInEventAddRemove = async (event, name, college) => {
    let c;
    let result;
    try {
      const { client, db } = await createConnection();
      c = client;
      const col = await db.collection('events');
      result = await col.findOne({
        event,
        'results.name': name,
        'results.college': college,
      });
      debug('-----------result 1 starts----------');
      debug(result);
      debug('------------result 1 ends---------');

      if (result) {
        await removeResultInEvent(col, event, name, college);
      } else {
        await addResultInEvent(col, event, name, college);
      }
    } catch (error) {
      debug(error);
    }
    c.close();
    return result;
  };
  // ====================================================================================
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
    updateIsAllowed,
    updateHasStarted,
    updateHasCompleted,
    addFriend,
    addResponseInEvent,
    resultsInEventAddRemove,
  };
};

module.exports = mongo;
