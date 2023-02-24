const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  hq: { type: String, required: true },
  founded: { type: String, required: true },
  ceo: { type: String, required: true },
  employees: { type: String, required: true },
  marketCap: { type: String, required: true },
  priceEarningsRatio: { type: String, required: true },
  dividendYield: { type: String, required: true },
  averageVolume: { type: String, required: true },
}, { timestamps: true });


module.exports = mongoose.model('Company', companySchema);
