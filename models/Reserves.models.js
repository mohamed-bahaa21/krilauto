const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
const Date = mongoose.Schema.Types.Date;

const ReserveSchema = new mongoose.Schema({
  ownerId: {
    type: ObjectID,
    required: true,
    ref: 'User'
  },
  carId: {
    type: ObjectID,
    ref: 'Car',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
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
