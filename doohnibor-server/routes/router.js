const passport = require('passport');
const AuthenticationController = require('../controllers/authentication');
const UserController = require('../controllers/api/user');
const CompaniesController = require('../controllers/api/companies');
const StocksController = require('../controllers/api/stocks');
const NewsfeedController = require('../controllers/api/newsfeed');
const MarketDataController = require('../controllers/api/marketData');
const PortfolioController = require('../controllers/api/portfolio');
const FundamentalsController = require('../controllers/api/fundamentals');
const passportService = require('../services/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = (app) => {
  app.get('/', requireAuth, (req, res) => {
    res.send({ hi: 'there' });
  });
  app.get('/api/get_companies', CompaniesController.get_companies);
  app.post('/api/signin', requireSignin, AuthenticationController.signin);
  app.post('/api/signup', AuthenticationController.signup);

  app.post('/api/get_user_name', UserController.get_user_name);

  app.post('/api/search_companies', CompaniesController.search_companies);
  app.post('/api/follow_company', CompaniesController.follow_company);
  app.post('/api/unfollow_company', CompaniesController.unfollow_company);
  app.post('/api/get_followed_companies', CompaniesController.get_followed_companies);

  app.post('/api/buy_stock', StocksController.buy_stock);
  app.post('/api/sell_stock', StocksController.sell_stock);
  app.post('/api/get_stocks', StocksController.get_stocks);

  app.post('/api/get_buying_power', PortfolioController.get_buying_power);
  app.post('/api/set_buying_power', PortfolioController.set_buying_power);
  app.post('/api/portfolio_value', PortfolioController.get_portfolio_value);
  app.post('/api/portfolio_intraday', PortfolioController.portfolio_intraday);

  app.post('/api/get_fundamentals', FundamentalsController.get_fundamentals);

  app.post('/api/newsfeed', NewsfeedController.newsFeed);
  app.post('/api/newsfeed_followed', NewsfeedController.newsFeedFollowed);

  app.post('/api/latest_price', MarketDataController.latest_price);
  app.post('/api/intraday_data', MarketDataController.intraday_data);
  app.post('/api/daily_data', MarketDataController.daily_data);

  // Client will periodically ping the backend when signin page is loaded, just to wake it up on Heroku
  app.get('/api/heroku_ping', (req, res) => {
    res.send({ ping: 'You pinged?' });
  });
};
