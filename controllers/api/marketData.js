const axios = require('axios');
const Company = require('../../models/Company');
const { cacheShouldRefresh, formatOpenPriceKey } = require('../../util/market_data_util');

const { ALPHA_VANTAGE_KEY } = process.env;
const API_URL = 'https://www.alphavantage.co';

// @TODO: Catch errors

/*
 * ///////////////////////
 * LATEST PRICE CONTROLLER
 * ///////////////////////
 */

// Create cache for latest_price outside of controller function scope
const latestPriceCache = new Map();

exports.latest_price = async (req, res, next) => {
  const { symbol } = req.body;

  /*

  // Create new timestamp each time this function is called
  // Will be used to decide whether to use cached articles or to make new API request
  const now = new Date(Date.now());
  */

  if (!symbol) {
    return res.status(422).send({ error: 'A company symbol is required to retrieve data' });
  }

  const apiGet = async () => {
    try {
      const response = await axios.get(`${API_URL}/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`);
      const metaData = Object.values(response.data)[0];
      const timeData = Object.values(response.data)[1];
      const lastRefresh = Object.values(metaData)[2];

      const lastData = Object.values(timeData[lastRefresh]);
      const lastClose = lastData[3];

      return {
        lastRefresh,
        value: lastClose
      };
    } catch (err ){
      console.log('TRIED TO GET LATEST PRICE, BUT RECEIVED ERROR: ', err);
    }
  };

  let cacheVal = latestPriceCache.get(symbol);
  if (!cacheVal || cacheShouldRefresh(cacheVal.lastRefresh)) {
    console.log('Retrieving fresh prices!!!');
    const retrieve = await apiGet();
    latestPriceCache.set(symbol, retrieve);
    cacheVal = retrieve;
    console.log('CACHE VAL: ', cacheVal);
  }

  // Update Company's price in DB with the latest price
  Company.findOneAndUpdate({ symbol }, { $set: { price: cacheVal.value } }, (err, company) => {
    if (err) {
      return next(err);
    }
  });

  // Convert cacheVal.value from String to Number
  const latestPrice = parseFloat(cacheVal.value, 10);

  // Send latest price to client
  res.json(latestPrice);
};

/*
 * ///////////////////////
 * INTRADAY DATA CONTROLLER
 * ///////////////////////
 */

// Create cache for intraday_data outside of controller function scope
const intradayCache = new Map();

exports.intraday_data = async (req, res) => {
  const { symbol } = req.body;
  const now = new Date(Date.now());
  
  const apiGet = async () => {
    try {
      const response = await axios.get(`${API_URL}/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`);

      const metaData = Object.values(response.data)[0];
      const timeData = Object.values(response.data)[1];

      const lastRefresh = Object.values(metaData)[2];

      const timePoints = Object.keys(timeData);
      const pricePoints = Object.values(timeData);

      // Map timePoints to prices using the 'close' value for each 5 minute interval
      const responseObj = {};

      const closePoints = [];

      for (let i = 0; i < pricePoints.length; i++) {
        closePoints.push(pricePoints[i]['4. close']);
      }

      for (let i = 0; i < timePoints.length; i++) {
        responseObj[timePoints[i]] = closePoints[i];
      }

      return {
        lastRefresh,
        responseObj
      };
    } catch (err) {
      console.log('TRIED TO GET INTRADAY DATA, BUT RECEIVED ERROR: ', err);
    }
  };

  let cacheVal = intradayCache.get(symbol);

  if (!cacheVal || cacheShouldRefresh(cacheVal.lastRefresh)) {
    console.log('Retrieving fresh intraday data!!!');
    const retrieve = await apiGet();
    intradayCache.set(symbol, retrieve);
    cacheVal = retrieve;
  }

  res.send(cacheVal.responseObj);
};

/*
 * ///////////////////////
 * DAILY DATA CONTROLLER
 * ///////////////////////
 */

exports.daily_data = async (req, res) => {
  const { query } = req.body;
  const response = await axios.get(`${API_URL}/query?function=TIME_SERIES_DAILY&symbol=${query}&apikey=${ALPHA_VANTAGE_KEY}`);
  const responseData = Object.values(response.data)[1];
  res.json(responseData);
};
