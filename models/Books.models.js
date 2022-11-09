const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cover: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: ObjectID,
        required: true,
        ref: 'Category'
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;