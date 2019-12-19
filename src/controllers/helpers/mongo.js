const { MongoClient } = require('mongodb');
const debug = require('debug')('app:mongoHelper');

const mongo = () => {
  const port = process.env.DB_PORT || 27017;
  const host = process.env.DB_HOST || 'localhost';
  const username = process.env.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || '';
  const dbName = 'portal';
  const url = `mongodb://${username.length ? `${username}:${password}@` : ``}${host}:${port}`;

  const createConnection = async () => {
    debug('request for connection sent');
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    debug('request for connection accepted');
    return { client, db };
  };

  const addUser = async (req, res, userAccount) => {
    const { client, db } = await createConnection();
    debug('Connected correctly to server');
    const col = await db.collection('users');
    const results = await col.insertOne(userAccount);
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

  const findEvent = async (eventCode) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOne({ eventCode });
    client.close();
    return result;
  };

  const findEventAndDelete = async (eventCode) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOneAndDelete({ eventCode });
    client.close();
    return result;
  };

  const addEvent = async (data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.insertOne(data);
    client.close();
    return result;
  };

  const findEventAndUpdateIsLive = async (eventCode, flag, isEvent) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    if (isEvent) {
      await col.findOneAndUpdate({ eventCode }, { $set: { isEventLive: flag } });
    } else {
      await col.findOneAndUpdate({ eventCode }, { $set: { isQuizLive: flag } });
    }
    client.close();
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
            questions: false,
            instructions: false,
            intro: false,
          },
        },
      )
      .toArray();
    client.close();
    return allEvents;
  };

  const findLiveEvents = async () => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const liveEvents = await col
      .find(
        { isEventLive: true },
        {
          projection: {
            _id: false,
            questions: false,
            instructions: false,
          },
        },
      )
      .toArray();
    client.close();
    return liveEvents;
  };

  const findRequestByEvent = async (eventCode) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.find({ eventCode }).toArray();
    client.close();
    return result;
  };

  const findRequestsByUser = async (email) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.find({ email }).toArray();
    client.close();
    return result;
  };

  const findRequestByEventUserAddRemove = async (requestData, deleteRequest) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.findOne(
      {
        eventCode: requestData.eventCode,
        email: requestData.email,
      },
    );
    if (deleteRequest) {
      if (result) {
        if (!result.isAllowed) {
          await col.findOneAndDelete({ eventCode: requestData.eventCode, email: requestData.email });
        }
      } else {
        await col.insertOne(requestData);
      }
    }
    client.close();
    return result;
  };

  const updateIsAllowed = async (eventCode, email, flag) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { eventCode, email },
      { $set: { isAllowed: flag } },
    );
    client.close();
    return results;
  };

  const updateHasStarted = async (eventCode, email) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { eventCode, email },
      { $set: { hasStarted: true } },
    );
    client.close();
    return results;
  };

  const updateHasCompleted = async (eventCode, email) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { eventCode, email },
      { $set: { hasCompleted: true } },
    );
    client.close();
    return results;
  };

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

  const addResponseInEvent = async (eventCode, userQuizResponse) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${eventCode}`);
    const result = await col.insertOne(userQuizResponse);
    client.close();
    return result;
  };

  const findResponsesByEvent = async (eventCode) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${eventCode}`);
    const result = await col.find({}, { projection: { responseStorage: false } }).toArray();
    client.close();
    return result;
  };

  const findResponseByEventUser = async (eventCode, email) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${eventCode}`);
    const result = await col.findOne({ 'user.email': email });
    client.close();
    return result;
  };

  const resultsOfEventAddRemove = async (eventCode, eventName, name, college) => {
    const { client, db } = await createConnection();
    const col = await db.collection('results');
    const result = await col.findOne({
      eventCode,
      name,
      college,
    });
    if (result) {
      await col.findOneAndDelete({ eventCode, name, college });
    } else {
      await col.insertOne({ eventCode, eventName, name, college });
    }

    client.close();
    return result;
  };

  const findResultByEvent = async (eventCode) => {
    const { client, db } = await createConnection();
    const col = await db.collection('results');
    const results = await col.find({ eventCode }).toArray();
    client.close();
    return results;
  }

  const findResultOfAllEvents = async () => {
    const { client, db } = await createConnection();
    const col = await db.collection('results');
    const results = await col.aggregate([
      {
        $group:
        {
          _id: {
            eventCode: '$eventCode',
            eventName: '$eventName',
          },
          fields: { $push: { 'name': '$name', 'college': '$college' } },
        },
      }
    ]).toArray();
    client.close();
    return results;
  }

  return {
    createConnection,
    addUser,
    findUserByEmail,
    findEvent,
    findEventAndUpdateIsLive,
    addEvent,
    findLiveEvents,
    findAllEvents,
    findEventAndDelete,
    findRequestByEvent,
    findRequestsByUser,
    findRequestByEventUserAddRemove,
    updateIsAllowed,
    updateHasStarted,
    updateHasCompleted,
    addFriend,
    addResponseInEvent,
    findResponsesByEvent,
    findResponseByEventUser,
    resultsOfEventAddRemove,
    findResultByEvent,
    findResultOfAllEvents,
  };
};

module.exports = mongo;
