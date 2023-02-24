const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true,
  },
  company_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
  num_shares: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Stock', StockSchema);
