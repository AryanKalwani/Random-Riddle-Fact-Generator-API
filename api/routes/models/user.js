const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
  },
  previousriddles: {
    type: [String],
  },
  previousfacts: {
    type: [String],
  },
});

module.exports = User = mongoose.model('user', UserSchema);
