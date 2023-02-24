const mongoose = require('mongoose');

const WatchListItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  company_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
}, { timestamps: true });

module.exports = mongoose.model('WatchListItem', WatchListItemSchema);
