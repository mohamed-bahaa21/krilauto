const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  account_type: {
    type: String,
    required: true,
    default: "User",
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  reserves: [{
    reserveId: {
      type: ObjectID,
      ref: 'Reserve',
      required: false
    },
  }],
  cart: {
    type: ObjectID,
    ref: 'Reserve',
  }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
