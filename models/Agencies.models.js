const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const AgencySchema = new mongoose.Schema({
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
    default: "Agency",
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  cars: [{
    type: ObjectID,
    ref: 'Car',
    required: false
  }],
});


const Agency = mongoose.model('Agency', AgencySchema);

module.exports = Agency;
