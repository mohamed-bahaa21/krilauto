const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  books: [{
    bookId: {
      type: ObjectID,
      ref: 'Book',
    },
  }]
});


const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
