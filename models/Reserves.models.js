const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const ReserveSchema = new mongoose.Schema({
  owner: {
    type: ObjectID,
    required: true,
    ref: 'User'
  },
  carId: {
    type: ObjectID,
    ref: 'Car',
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

const Reserve = mongoose.model('Reserve', ReserveSchema);

module.exports = Reserve;
