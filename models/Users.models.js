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
  books: [{
    bookId: {
      type: ObjectID,
      ref: 'Book',
      required: true
    },
  }],
  whishlists: [{
    listId: {
      type: ObjectID,
      ref: 'Wishlist',
    },
  }],
  cart: {
    type: ObjectID,
    ref: 'Wishlist',
  },
  orders: [{
    orderId: {
      type: ObjectID,
      ref: 'Order',
    },
  }],
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
