const axios = require('axios');
const Stock = require('../../models/Stock');
const Company = require('../../models/Company');
const User = require('../../models/User');

const dotenv = require('dotenv');
dotenv.config();
const { ALPHA_VANTAGE_KEY, ALPHA_VANTAGE_API_URL } = process.env;

const { 
  cacheShouldRefresh,
  getYesterdayTimestamp,
  getMonthAgoTimestamp,
} = require('../../util/market_data_util');

exports.get_portfolio_value = (req, res, next) => {
  const { currentUserId } = req.body;

  if (!currentUserId) {
    res.status(422).send({ Error: 'The current user\'s id is required to look up their portfolio value' });
  }

  // Find all stocks owned by current user
  Stock.find({ user_id: currentUserId }, (err, stocks) => {
    if (err) {
      return next(err);
    }

    const stockValues = [];
    let done = stocks.length;

    // For each stock, look up the current price for the company,
    // then multiply by number of shares owned by user
    stocks.forEach((stock) => {
      Company.find({ _id: stock.company_id }, (error, company) => {
        if (error) {
          return next(err);
        }

        const companyPrice = company[0].price.toFixed(2);
        const { num_shares } = stock;
        const stockValue = num_shares * companyPrice;
        stockValues.push(stockValue);
        done--;
        if (done === 0) {
          const portfolioValue = stockValues.reduce((a, b) => a + b, 0).toFixed(2);
          res.send(portfolioValue);
        }
      });
    });
  });
};


/*
 * ///////////////////////
 * PORTFOLIO INTRADAY CONTROLLER
 * ///////////////////////
 */

// Create cache for portfolio_intraday
const portfolioIntraCache = new Map();

exports.portfolio_intraday = async (req, res) => {
  const { symbols } = req.body;
  
  const apiGet = async symbol => {
    try {
      const response = await axios.get(
        `${ALPHA_VANTAGE_API_URL}/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`
      );

      const timeData = Object.values(response.data)[1];
      let timePoints = Object.keys(timeData);
      let pricePoints = Object.values(timeData);

      // Map timePoints to prices using the 'close' value for each 5 minute interval
      let responseObj = {};
      // Slicing off yesterday's data. We only want data from 09:35:00-16:00:00 of today
      console.log(getYesterdayTimestamp());
      const cutOffIndex = timePoints.indexOf(`${getYesterdayTimestamp()} 16:00:00`);
      console.log('cutoffindex: ', cutOffIndex);
      timePoints = timePoints.slice(0, cutOffIndex);
      console.log('Sliced timePoints: ', timePoints);
      pricePoints = pricePoints.slice(0, cutOffIndex);
      
      // Loops through pricePoints backwards to get closePoints
      // from oldest to most recent
      const closePoints = [];
      for (let i = pricePoints.length - 1; i >= 0; i--) {
        closePoints.push(pricePoints[i]['4. close']);
      }

      // @TODO: Review!!! There's probably a better way of doing this
      // Reverse timePoints
      const newTimePoints = [];
      for (let i = timePoints.length - 1; i >= 0; i--) {
        newTimePoints.push(timePoints[i]);
      }

      // Map closePoints to corresponding timePoints
      for (let i = timePoints.length - 1; i >= 0; i--) {
        responseObj[timePoints[i]] = closePoints[i];
      }

      /*
      // Check that newTimePoints and closePoints are the same length
      // If not, we're going to be mapping prices to the wrong time points
      
      if (newTimePoints.length === closePoints.length) {
        //console.log('wooo');
        
      }
      */


      for (let i = 0; i < newTimePoints.length; i++) {   
        responseObj[newTimePoints[i]] = closePoints[i];
      }

      //console.log('responseObj: ', responseObj);
      return responseObj;

    } catch (err) {
      return err;
    }
  }; // End function apiGet()

  // Create new timestamp each time this function is called
  // Will be used to decide whether to use cached data or to make new API request

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //@TODO: lastRefresh is returning time in the wrong timezone. Should be local timezone rather than UTC
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const now = new Date(Date.now());

  const promises = symbols.map( async symbol => {
    let cacheVal = portfolioIntraCache.get(symbol);

    if (!cacheVal || cacheShouldRefresh(cacheVal.lastRefresh)) {
      const retrieve = await apiGet(symbol);
      const valuesObj = {
        lastRefresh: now,
        apiResponse: retrieve
      };
      portfolioIntraCache.set(symbol, valuesObj);
      cacheVal = valuesObj;
    }
    //console.log('cacheVal: ', cacheVal);
    return cacheVal.apiResponse;
  });


  Promise.all(promises)
    .then((values) => {
      const timeKeys = Object.keys(values[0]);
      const sumObject = {};

      for (let i = 0; i < timeKeys.length; i++) {
        const timeKey = timeKeys[i];

        for (let j = 0; j < values.length; j++) {
          const number = parseFloat(values[j][timeKey]);
          if (!sumObject[timeKey]) {
            sumObject[timeKey] = number;
          } else {
            const existingValue = sumObject[timeKey];
            sumObject[timeKey] = existingValue + number;
          }
        }
      }

      res.json(sumObject);
    })
    .catch((reason) => {
      console.log('PROMISE FAILED BECAUSE: ', reason);
    });
};


/*
 * ///////////////////////
 * PORTFOLIO PASTWEEK CONTROLLER
 * ///////////////////////
 */

 // Create cache for portfolio_pastweek
 const portfolioPastWeekCache = new Map();

 exports.portfolio_pastweek = async (req, res) => {
   let { symbols } = req.query;

   // Make sure symbols is an array
   symbols = !Array.isArray(symbols) ? [symbols] : symbols;  

   const apiGet = async (symbol) => {
     try {
      const response = await axios.get(
        `${ALPHA_VANTAGE_API_URL}/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );

      const data = Object.values(response.data)[1];
      const timePoints = Object.keys(data);
      const pricePoints = Object.values(data);

      let responseObj = {};

      function getLastFiveDays() {
        let lastFiveDays = [];
        for (let i = 4; i >= 0; i--) {
          lastFiveDays.push(timePoints[i]);
        }

        return lastFiveDays;
      }

      function getLastFivePrices() {
        let lastFivePrices = [];
        for (let i = 4; i >= 0; i--) {
          lastFivePrices.push(pricePoints[i]['5. adjusted close']);
        }
        
        return lastFivePrices;
      }

      // Map lastFivePrices/lastFiveDays to responseObj
      const lastFiveDays = getLastFiveDays();
      const lastFivePrices = getLastFivePrices();

      for (let i = 0; i < 5; i++) {
        responseObj[lastFiveDays[i]] = lastFivePrices[i];
      }

      return responseObj;
     } catch (err) {
       return err;
     }
   };

   // Create new timestamp each time this function is called
  // Will be used to decide whether to use cached data or to make new API request
  const now = new Date(Date.now());

  
  const promises = symbols.map( async symbol => {
    let cacheVal = portfolioPastWeekCache.get(symbol);

    if (!cacheVal || cacheShouldRefresh(cacheVal.lastRefresh)) {
      const retrieve = await apiGet(symbol);
      const valuesObj = {
        lastRefresh: now,
        apiResponse: retrieve
      };

      portfolioPastWeekCache.set(symbol, valuesObj);
      cacheVal = valuesObj;
    }
    return cacheVal.apiResponse;
  });

  Promise.all(promises)
    .then((values) => {
      const timeKeys = Object.keys(values[0]);
      let sumObject = {};

      for (let i = 0; i < timeKeys.length; i++) {
        const timeKey = timeKeys[i];

        for (let j = 0; j < values.length; j++) {
          const number = parseFloat(values[j][timeKey]);

          if (!sumObject[timeKey]) {
            sumObject[timeKey] = number;
          } else {
            const existingValue = sumObject[timeKey];
            sumObject[timeKey] = existingValue + number;
          }
        }
      }

      res.json(sumObject);
    })
    .catch((reason) => {
      console.log('Promises failed to resolve because ', reason);
    });
 };

 /*
 * ///////////////////////
 * PORTFOLIO PASTMONTH CONTROLLER
 * ///////////////////////
 */

 // Create cache for portfolio_pastmonth
 const portfolioPastMonthCache = new Map();

 exports.portfolio_pastmonth = async (req, res) => {
  let { symbols } = req.query;

  const apiGet = async symbol => {
    try {
      const response = await axios.get(
        `${ALPHA_VANTAGE_API_URL}/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );

      const data = response.data['Time Series (Daily)'];
      const timePoints = Object.keys(data);
      const monthAgoKey = getMonthAgoTimestamp();
      const monthAgoIndex = timePoints.indexOf(monthAgoKey);
      const pastMonthTimePoints = Object.keys(data).slice(0, monthAgoIndex + 1);

      let responseObj = {};

      for (let i = pastMonthTimePoints.length; i > 0; i--) {
        console.log('woo');
        const date = pastMonthTimePoints[i];
        console.log(date);
        responseObj[date] = data[date]['5. adjusted close'];
      }

      console.log(responseObj);

    } catch (err) {
      return err;
    }
  };

  apiGet(symbols[0]);
 };

exports.get_buying_power = (req, res, next) => {
  const { currentUserId } = req.body;

  User.find({ _id: currentUserId }, (err, user) => {
    if (err) {
      return next(err);
    }

    res.send(user);
  });
};

exports.set_buying_power = (req, res, next) => {
  const { currentUserId, value } = req.body;

  if(!currentUserId) {
    res.status(422).send({ Error: 'user_id required to fulfill request' });
  }

  if(!value) {
    res.status(422).send({ Error: 'Portfolio value required to perform calculation' });
  }

  const newValue = 5000 - value;

  User.findOneAndUpdate({ _id: currentUserId }, { $set: { buyingPower: newValue } }, (err, user) => {
    if (err) {
      return next(err);
    }

    res.json(newValue);
  });
};
