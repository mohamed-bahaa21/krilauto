const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const CartSchema = new mongoose.Schema({
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

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
