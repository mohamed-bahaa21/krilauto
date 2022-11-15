const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
const Date = mongoose.Schema.Types.Date;

const ReserveSchema = new mongoose.Schema({
  userId: {
    type: ObjectID,
    required: true,
    ref: 'User'
  },
  agencyId: {
    type: ObjectID,
    required: true,
    ref: 'Agency'
  },
  carId: {
    type: ObjectID,
    ref: 'Car',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  agencyName: {
    type: String,
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  fullFilled: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
})

const Reserve = mongoose.model('Reserve', ReserveSchema);

module.exports = Reserve;
