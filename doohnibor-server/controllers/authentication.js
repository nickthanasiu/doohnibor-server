const jwt = require('jwt-simple');
const dotenv = require('dotenv');
dotenv.config();
const { PASSPORT_SECRET } = process.env;

const User = require('../models/User');
const Company = require('../models/Company');
const Stock = require('../models/Stock');
const WatchListItem = require('../models/WatchListItem');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, PASSPORT_SECRET);
}

exports.signin = (req, res) => {
  const { user } = req;
  res.send({
    token: tokenForUser(user),
    currentUserId: user._id
  });
};

exports.signup = (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body;

  // Make sure all required fields are included in signup
  if (!firstName || !lastName || !email || !password) {
    return res.status(422).send({ error: 'Missing required field(s)' });
  }

  // Check if user with given email exists
  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      console.log('USER FINDONE ERR: ', err);
      return next(err);
    }

    // If a user with provided email already exists, return error
    if (existingUser) {
      return res.status(422).send({ error: 'Provided email is already in use' });
    }

    // If a user with provided email does NOT exist,
    // create and save user record
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      buyingPower: 5000
    });

    // Save user
    user.save((userSaveError) => {
      if (userSaveError) {
        return next(userSaveError);
      }
    });

    // Upon signing up, the new user will have one share of Facebook stock
    // We need to query DB to determine Facebook's company id because
    // it will be given a new id each time the DB is seeded
    // Create stock
    Company.findOne({ symbol: 'FB' }, (error, company) => {
      if (error) {
        return next(error);
      }


      const companyId = company._id;

      const facebookStock = new Stock({
        user_id: user._id,
        company_id: companyId,
        num_shares: 1
      });

      // Save Facebook Stock
      facebookStock.save((stockSaveErr) => {
        if (stockSaveErr) {
          return next(stockSaveErr);
        }
      });

      // User should also have some companies on their watchlist
      // Find Netflix and Tesla in DB so we can use their id's to create Watchlist Items
      Company.find({ symbol: { $in: ['TSLA', 'NFLX'] } }, (companyFindErr, companies) => {
        if (companyFindErr) {
          return next(companyFindErr);
        }

        // Create Watchlist Items
        companies.forEach((company) => {
          const companyId = company._id;

          const watchListItem = new WatchListItem({
            user_id: user._id,
            company_id: companyId
          });

          // Save WatchList Item
          watchListItem.save((watchSaveErr) => {
            if (watchSaveErr) {
              return next(watchSaveErr);
            }
          });
        });

        // Respond to request by sending user a token
        res.json({
          token: tokenForUser(user),
          currentUserId: user._id
        });
      });
    });
  });
};
