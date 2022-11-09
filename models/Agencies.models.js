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
    required: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  cars: [{
    carId: {
      type: ObjectID,
      ref: 'Car',
      required: true
    },
  }],
});


const Agency = mongoose.model('Agency', AgencySchema);

module.exports = Agency;
