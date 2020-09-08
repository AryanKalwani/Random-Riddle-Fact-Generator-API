const mongoose = require('mongoose');

const factSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  author: String,
});

module.exports = mongoose.model('fact', factSchema);
