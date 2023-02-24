const axios = require('axios');

exports.get_fundamentals = (req, res) => {
  const { symbol } = req.body;

  const apiGet = async (symbol) => {
    const response = await axios.get(`https://api.robinhood.com/fundamentals/${symbol}/`);

    res.json(response.data);
  };

  apiGet(symbol);
};
