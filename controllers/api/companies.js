const Company = require('../../models/Company');
const WatchListItem = require('../../models/WatchListItem');

exports.search_companies = (req, res, next) => {
  const { symbol, name } = req.body;

  // Make sure a Company's Symbol or Name was passed
  if (!symbol && !name) {
    res.status(422).send({ error: 'Your Search must contain name or symbol' });
  }

  // Check if Company with given symbol exists in db
  Company.find({ $or: [{ symbol }, { name }] }, (err, company) => {
    if (err) {
      return next(err);
    }

    // company is returned as an array
    // if the company we're looking for is not in the database
    // an empty array is returned
    if (company.length === 0) {
      res.status(422).send({ error: 'Could not find a company with that symbol' });
    }

    res.json(company);
  });
};

exports.get_companies = (req, res, next) => {
  Company.find({}, (err, companies) => {
    if (err) {
      return next(err);
    }

    // Respond with array of companies
    res.json(companies);
  });
};

// @TODO: Catch Errors
// @TODO: A user should not be able to follow a company twice...make it so
exports.follow_company = (req, res, next) => {
  const { currentUserId, companyId } = req.body;

  // Create a WatchListItem with the provided ID's
  const stock = new WatchListItem({
    user_id: currentUserId,
    company_id: companyId,
  });

  stock.save();

  res.json(stock);
};

exports.unfollow_company = (req, res, next) => {
  const { currentUserId, companyId } = req.body;

  // Find WatchListItem Item to delete
  WatchListItem.deleteOne({ user_id: currentUserId, company_id: companyId }, (err) => {
    if (err) {
      return next(err);
    }
  });
};

exports.get_followed_companies = (req, res, next) => {
  const { currentUserId } = req.body;

  let followedCompanies = [];

  WatchListItem.find({ user_id: currentUserId }, (err, stocks) => {
    if (err) {
      return next(err);
    }

    let done = 0;
    // Search Companies for companies matching the returned stocks' company_id's
    stocks.forEach((stock) => {
      Company.find({ _id: stock.company_id }, (error, company) => {
        if (error) {
          return next(error);
        }

        followedCompanies = [...followedCompanies, ...company];
        done++;
        // Once all returned companies have been added to followedCompanies array, send it to client
        if (done === stocks.length) {

          // @TODO:
          // Before sending response, check followedCompanies array for duplicates and remove them
          res.send(followedCompanies);
        }
      });
    });
  });
};
