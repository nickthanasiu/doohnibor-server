const User = require('../../models/User');

exports.get_user_name = (req, res, next) => {
  const { currentUserId } = req.body;

  if (!currentUserId) {
    return res.status(422).send({ Error: 'A user ID is required to fetch a user name' });
  }

  User.findOne({ _id: currentUserId }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(404).send({ Error: 'No user was found' });
    }

    const { firstName, lastName } = user;
    const username = `${firstName} ${lastName}`;

    res.json(username);
  });
};
