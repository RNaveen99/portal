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
  //done
  const findEventByName = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOne({ event });
    client.close();
    return result;
  };
  //done
  const findEventByNameAndDelete = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.findOneAndDelete({ event });
    client.close();
    return result;
  };
  //done
  const addEvent = async (data) => {
    const { client, db } = await createConnection();
    const col = await db.collection('events');
    const result = await col.insertOne(data);
    client.close();
    return result;
  };
  //done
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
  };
  //done
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
          },
        },
      )
      .toArray();
    client.close();
    return allEvents;
  };
  //done
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
            results: false,
          },
        },
      )
      .toArray();
    client.close();
    return liveEvents;
  };
  //done
  const findRequestByEvent = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.find({ event }).toArray();
    client.close();
    return result;
  };
  //done
  const findRequestByUser = async (email) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.find({ email }).toArray();
    client.close();
    return result;
  };
  //done
  const findRequestByEventUserAddRemove = async (requestData, flag) => {
    const { client, db } = await createConnection();
    const col = await db.collection('requests');
    const result = await col.findOne(
      {
        event: requestData.event,
        email: requestData.email,
      },
    );
    if (flag) {
      if (result) {
        await col.findOneAndDelete({ event: requestData.event, email: requestData.email });
      } else {
        await col.insertOne(requestData);
      }
    }
    client.close();
    return result;
  };
  //done
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
  //done
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
  //done
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
  //done
  const addResponseInEvent = async (event, userQuizResponse) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.insertOne(userQuizResponse);
    client.close();
    return result;
  };
  //done
  const findResponseByEvent = async (event) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.find({}, { projection: { dataArray: false } }).toArray();
    client.close();
    return result;
  };
  //done
  const findResponseByEventUser = async (event, email) => {
    const { client, db } = await createConnection();
    const col = await db.collection(`${event}`);
    const result = await col.findOne({ 'user.email': email });
    client.close();
    return result;
  };
  
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
    if (result) {
      await removeResultInEvent(col, event, name, college);
    } else {
      await addResultInEvent(col, event, name, college);
    }

    client.close();
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
    resultsInEventAddRemove,
  };
};

module.exports = mongo;
