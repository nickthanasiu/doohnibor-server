const NewsAPI = require('newsapi');
//const { NEWS_API_KEY } = process.env;
const NEWS_API_KEY = '6cd3a288d1bb482fb535de003e778dbf';
const newsapi = new NewsAPI(NEWS_API_KEY);

// @TODO: resplace shuffleArray function with a function that sorts the articles by date

const { shuffleArray, getPastWeekDates } = require('../../util/newsfeed_util');
const { cacheShouldRefresh } = require('../../util/market_data_util');

// Returns object containing today's date (dates.to) and the date one week ago (dates.from)
const dates = getPastWeekDates();

/*
 * /////////////////////////////////////
 *  NewsFeed Controller for company pages
 * /////////////////////////////////////
 */

 // Create cache for newsfeed
 // Should only check for new articles every 5 minutes
 const newsfeedCache = new Map();

exports.newsFeed = async (req, res) => {
  // query will be the name of a company
  const { query } = req.body;
  const company = query;

  // Create new timestamp each time this function is called
  // Will be used to decide whether to use cached articles or to make new API request
  const now = new Date(Date.now());

  // Throw error if no query company is passed
  if (!company) {
    return res.status(422).send({ Error: 'A query must be provided to retrieve news articles' });
  }

  // News API Request using their Node.js client library
  // Documentation can be found here: https://github.com/bzarras/newsapi
  // @TODO: Update from/to dates to reflect the current week
  const apiGet = async () => {
    try {
      return await newsapi.v2.everything({
        q: `${query}`,
        sources: 'bbc-news, the-verge, bloomberg, axios',
        domains: 'bbc.co.uk, techcrunch.com, bloomberg.com, axios.com',
        from: `${dates.from}`,
        to: `${dates.to}`,
        language: 'en',
        sortBy: 'relevancy',
        page: 1,
      });
    } catch (err) {
      console.log('TRIED TO FETCH ARTICLES, BUT CAUGHT ERROR: ', err);
    }
  };


  let cacheVal = newsfeedCache.get(company);

  if (!cacheVal || cacheShouldRefresh(cacheVal.lastRefresh)) {
    console.log('Retrieving fresh articles!!!');
    const retrieve = await apiGet();
    const valueObj = {
      lastRefresh: now,
      apiResponse: retrieve
    };

    newsfeedCache.set(company, valueObj);
    cacheVal = valueObj;
  }

  res.json(cacheVal.apiResponse);
};

/*
 * /////////////////////////////////////
 *  NewsFeed Controller for Dashboard
 * /////////////////////////////////////
 */

 // Create cache for newsfeed
 // Should only check for new articles every 5 minutes
 // @TODO: Create cache for newsFeedFollowed

exports.newsFeedFollowed = (req, res) => {
  const { queryArray } = req.body;
  const companyNames = [];

  queryArray.forEach((company) => {
    companyNames.push(company.name);
  });

  const apiGet = (companyName) => {
    return newsapi.v2.everything({
      q: `${companyName}`,
      sources: 'bbc-news, the-verge, bloomberg, axios',
      domains: 'bbc.co.uk, techcrunch.com, bloomberg.com, axios.com',
      from: `${dates.from}`,
      to: `${dates.to}`,
      language: 'en',
      sortBy: 'relevancy',
      page: 1
    });
  };

  const makePromise = (names) => {
    const promises = names.map((name) => {
      return apiGet(name);
    });

    return Promise.all(promises);
  };

  makePromise(companyNames)
    .then((resp) => {
      let i = 0;

      const articlesArray = resp.map((r) => {
        const { articles } = r;
        articles.splice(3);
        articles.forEach((article) => {
          article.company = companyNames[i];
        });
        i++;
        return articles;
      });

      const responseArray = articlesArray.reduce((prev, curr) => {
        return prev.concat(curr);
      });

      // Shuffle responseArray before sending
      res.json(shuffleArray(responseArray));
    });
};
