const { MongoClient } = require('mongodb');
const debug = require('debug')('app:mongoHelper');

const mongo = () => {
  const port = process.env.DB_PORT || 27017;
  const host = process.env.DB_HOST || 'localhost';
  const username = process.env.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || '';
  const dbName = 'portal';
  // const url = `mongodb://${username}:${password}@${host}:${port}`;
  const url = `mongodb://${host}:${port}`;

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

  const findEventByNameAndDelete = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOneAndDelete({ event });
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

  const findEventByNameAndUpdateIsLive = async (event, flag, isEvent) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    if (isEvent) {
      await col.findOneAndUpdate({ event }, { $set: { isEventLive: flag } });
    } else {
      await col.findOneAndUpdate({ event }, { $set: { isQuizLive: flag } });
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

  const findEventByLive = async () => {
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

  const findRequestByEvent = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.find({ event }).toArray();
    client.close();
    return result;
  };

  const findRequestByUser = async (email) => {
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
        event: requestData.event,
        email: requestData.email,
      },
    );
    if (deleteRequest) {
      if (result) {
        if (!result.isAllowed) {
          await col.findOneAndDelete({ event: requestData.event, email: requestData.email });
        }
      } else {
        await col.insertOne(requestData);
      }
    }
    client.close();
    return result;
  };

  const updateIsAllowed = async (data, flag) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { event: data.event, email: data.email },
      { $set: { isAllowed: flag } },
    );
    client.close();
    return results;
  };

  const updateHasStarted = async (data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { event: data.event, email: data.email },
      { $set: { hasStarted: true } },
    );
    client.close();
    return results;
  };

  const updateHasCompleted = async (data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const results = await col.findOneAndUpdate(
      { event: data.event, email: data.email },
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

  const addResponseInEvent = async (event, userQuizResponse) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.insertOne(userQuizResponse);
    client.close();
    return result;
  };

  const findResponseByEvent = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.find({}, { projection: { dataArray: false } }).toArray();
    client.close();
    return result;
  };

  const findResponseByEventUser = async (event, email) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.findOne({ 'user.email': email });
    client.close();
    return result;
  };

  const removeResultOfEvent = async (col, event, name) => {
    const result = await col.findOneAndDelete({ event, name });
    return result;
  };

  const addResultOfEvent = async (col, event, eventName, name, college) => {
    const result = await col.insertOne({ event, eventName, name, college });
    return result;
  };

  const resultsOfEventAddRemove = async (event, eventName, name, college) => {
    const { client, db } = await createConnection();
    const col = await db.collection('results');
    const result = await col.findOne({
      event,
      name,
      college,
    });
    if (result) {
      await removeResultOfEvent(col, event, name);
    } else {
      await addResultOfEvent(col, event, eventName, name, college);
    }

    client.close();
    return result;
  };

  const findResultByEvent = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('results');
    const results = await col.find({ event }).toArray();
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
            event: '$event',
            eventName: '$eventName',
          },
          names: { $push: '$name' },
          college: { $push: '$college' },
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
    findEventByName,
    findEventByNameAndUpdateIsLive,
    addEvent,
    findEventByLive,
    findAllEvents,
    findEventByNameAndDelete,
    findRequestByEvent,
    findRequestByUser,
    findRequestByEventUserAddRemove,
    updateIsAllowed,
    updateHasStarted,
    updateHasCompleted,
    addFriend,
    addResponseInEvent,
    findResponseByEvent,
    findResponseByEventUser,
    resultsOfEventAddRemove,
    findResultByEvent,
    findResultOfAllEvents,
  };
};

module.exports = mongo;
