const express = require('express');
const debug = require('debug')('app:friendRoutes');
const { ifSignIn } = require('../controllers/helpers/restrictions')();
const { findUserByEmail, addFriend, getFriend, getAllFriends } = require('../controllers/helpers/mongo')();

const friendRouter = express.Router();

const router = () => {
  friendRouter
    .route('/')
    .all(ifSignIn)
    .get(async (req, res) => {
      const allFriends = await getAllFriends(req.user.email);
      res.render('friends', { allFriends });
    })
    .post(async (req, res) => {
      const { friendsEmail } = req.body;
      if (friendsEmail !== req.user.email) {
        const friend = await getFriend(req.user.email, friendsEmail);
        debug(friend)
        if (!friend) {
          const tempUser = await findUserByEmail(friendsEmail);
          if (tempUser) {
            delete tempUser._id;
            delete tempUser.password;
            delete tempUser.privileges;
            tempUser.leader = req.user.email;
            await addFriend(tempUser);
            req.flash('friendsEmailSuccess', 'Friend added in your friend list.');
          } else {
            req.flash('friendsEmailFailure', 'Email entered is not registered.');
          }
        } else {
          req.flash('friendsEmailFailure', 'Friend already in your friend list.');
        }
        res.redirect('/friends');
      } else {
        req.flash('friendsEmailFailure', 'You cannot provide your own Email');
        res.redirect('/friends');
      }
    });

  return friendRouter;
};

module.exports = router;
