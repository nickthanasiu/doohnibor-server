const Stock = require('../../models/Stock');
const Company = require('../../models/Company');

exports.buy_stock = (req, res) => {

  const {
    currentUserId,
    companyId,
    shares,
  } = req.body;

  // Make sure all required arguments are passed
  if (!currentUserId || !companyId) {
    res.status(422).send({ error: 'Both user and company id\'s are required to buy stock' });
  }

  if (!shares) {
    res.status(422).send({ error: 'Number of shares are required to buy stock' });
  }

  const stock = new Stock({
    user_id: currentUserId,
    company_id: companyId,
    num_shares: shares,
  });

  stock.save();

  res.json(stock);
};

exports.sell_stock = (req, res, next) => {

  const {
    currentUserId,
    companyId,
    shares,
  } = req.body;

  // Make sure all required arguments are passed
  if (!currentUserId || !companyId) {
    res.status(422).send({ error: 'Both user and company id\'s are required to sell stock' });
  }

  if (!shares) {
    res.status(422).send({ error: 'Number of shares are required to sell stock' });
  }

  const shareTotal = new Map();

  Stock.find({ $and: [{ user_id: currentUserId }, { company_id: companyId }] }, (err, stocks) => {
    if (err) {
      return next(err);
    }

    stocks.forEach((stock) => {
      const n = shareTotal.get(stock.company_id.toString()) === undefined ?
        0 : shareTotal.get(stock.company_id.toString());

      shareTotal.set(stock.company_id.toString(), n + stock.num_shares);
    });

    // Subtract the number of shares being sold from shareTotal
    shareTotal.set(companyId.toString(), shareTotal.get(companyId.toString()) - shares);

    // Once shareTotal is set, delete existing stocks associated with the given company_id
    Stock.remove({ company_id: companyId }, (error) => {
      if (error) {
        return next(err);
      }

      // Only create a new Stock if user still owns 1 or more shares in the company
      if (shareTotal.get(companyId.toString())) {
        // If no error, the Stocks should have been removed
        // Then, create and save new Stock with updated number of shares
        const newStock = new Stock({
          user_id: currentUserId,
          company_id: companyId,
          num_shares: shareTotal.get(companyId.toString()),
        });

        newStock.save();
      }
    });
  });
};


// @TODO: Add logic to update Company price before retrieving stocks
exports.get_stocks = (req, res, next) => {
  const { currentUserId } = req.body;

  const myStocks = [];

  const shareTotals = new Map();

  Stock.find({ user_id: currentUserId }, (err, stocks) => {
    if (err) {
      return next(err);
    }

    stocks.forEach((stock) => {
      const n = shareTotals.get(stock.company_id.toString()) === undefined ?
        0 : shareTotals.get(stock.company_id.toString());

      shareTotals.set(stock.company_id.toString(), n + stock.num_shares);
    });

    Company.find({ _id: { $in: Array.from(shareTotals.keys()) } }, (error, companies) => {
      if (error) {
        return next(error);
      }

      companies.forEach((company) => {
        myStocks.push({
          name: company.name,
          symbol: company.symbol,
          shares: shareTotals.get(company._id.toString()),
          value: (company.price * shareTotals.get(company._id.toString())).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
      });

      res.json(myStocks);
    });
  });
};
