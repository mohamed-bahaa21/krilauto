const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const WishlistSchema = new mongoose.Schema({
  owner: {
    type: ObjectID,
    required: true,
    ref: 'User'
  },
  books: [{
    bookId: {
      type: ObjectID,
      ref: 'Book',
    }
  }],
});


const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
