const mongoose = require('mongoose');

const riddleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  answer: String,
  author: String,
});

module.exports = mongoose.model('riddle', riddleSchema);
