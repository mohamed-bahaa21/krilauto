const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const OrderSchema = new mongoose.Schema({
  owner: {
    type: ObjectID,
    required: true,
    ref: 'User'
  },
  books: [{
    bookId: {
      type: ObjectID,
      ref: 'Book',
      required: true
    },
    name: String,
    price: Number
  }],
  bill: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
