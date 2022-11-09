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
    required: true
  },
  reserves: [{
    reserveId: {
      type: ObjectID,
      ref: 'Reserve',
      required: true
    },
  }],
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
