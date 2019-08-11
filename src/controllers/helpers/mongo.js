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
    const { client, db } = await createConnection();
    debug('Connected correctly to server');
    const col = await db.collection('users');
    const results = await col.insertOne(userAccount);
    // debug(results);
    req.logIn(results.ops[0], () => {
      res.redirect('/events');
    });
    client.close();
  };

  const findUserByEmail = async (email) => {
    const { client, db } = await createConnection();
    const col = await db.collection('users');
    const results = await col.findOne({ email });

    client.close();
    return results;
  };

  const findEventByName = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOne({ event });
    client.close();
    return result;
  };

  const findEventByNameAndUpdateIsLive = async (event, flag1, flag2) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    let results;
    if (flag2) {
      results = await col.findOneAndUpdate({ event }, { $set: { isEventLive: flag1 } });
    } else {
      results = await col.findOneAndUpdate({ event }, { $set: { isQuizLive: flag1 } });
    }
    client.close();
    return results.ok;
  };

  const addEvent = async (data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const results = await col.insertOne(data);
    client.close();
    return results;
  };

  const findEventByLive = async () => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const liveEvents = await col
      .find(
        { isEventLive: true },
        {
          projection: {
            _id: false,
            eventName: true,
            event: true,
            link: true,
            requests: true,
            intro: true,
          },
        },
      )
      .toArray();
    client.close();
    return liveEvents;
  };

  const findAllEvents = async () => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const allEvents = await col
      .find(
        {},
        {
          projection: {
            _id: false,
            event: true,
            eventName: true,
            results: true,
            isEventLive: true,
            isQuizLive: true,
          },
        },
      )
      .toArray();
    client.close();
    return allEvents;
  };
  const findEventByNameAndDelete = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOneAndDelete({ event });
    client.close();
    return result.ok;
  };
  //  ========================= findRequestInEventAddRemove =================================
  const removeRequestInEvent = async (col, requestData) => {
    const result = await col.findOneAndUpdate(
      { event: requestData.event },
      {
        $pull: {
          requests: {
            email: requestData.email,
          },
        },
      },
    );
    return result;
  };
  const addRequestInEvent = async (col, requestData) => {
    const result = await col.findOneAndUpdate(
      { event: requestData.event },
      {
        $push: {
          requests: {
            name: requestData.name,
            email: requestData.email,
            college: requestData.college,
            isAllowed: false,
            hasStarted: false,
            hasCompleted: false,
          },
        },
      },
    );
    return result;
  };
  const findRequestInEventAddRemove = async (requestData, flag) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOne(
      {
        event: requestData.event,
        'requests.email': requestData.email,
      },
      {
        projection: {
          _id: false,
          requests: true,
        },
      },
    );
    if (flag) {
      if (result) {
        await removeRequestInEvent(col, requestData);
      } else {
        await addRequestInEvent(col, requestData);
      }
    }
    client.close();
    return result;
  };
  // =========================================================================
  const updateIsAllowed = async (data, flag) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const results = await col.findOneAndUpdate(
      { event: data.event, 'requests.email': data.email },
      { $set: { 'requests.$.isAllowed': flag } },
    );
    client.close();
    return results;
  };
  const updateHasStarted = async (data, flag) => {
    const { client, db } = await createConnection();
    debug('======================');
    debug(data);
    debug('======================');
    const col = await db.collection('events');
    const results = await col.findOneAndUpdate(
      { event: data.event, 'requests.email': data.email },
      { $set: { 'requests.$.hasStarted': flag } },
    );

    client.close();
    return results;
  };
  const updateHasCompleted = async (data, flag) => {
    debug('====================================');
    debug(data);
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const results = await col.findOneAndUpdate(
      { event: data.event, 'requests.email': data.email },
      { $set: { 'requests.$.hasCompleted': flag } },
    );
    client.close();
    return results;
  };
  // ==============================================================================
  const addFriend = async (email, friend) => {
    const { client, db } = await createConnection();
    const col = await db.collection('users');
    const result = await col.findOneAndUpdate(
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

    client.close();
    return result;
  };

  // ====================================================================
  const addResponseInEvent = async (event, data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOneAndUpdate(
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

    client.close();
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
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOne({
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

    client.close();
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
