const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const CarSchema = new mongoose.Schema({
    ownerId: {
        type: ObjectID,
        required: true,
        ref: 'Agency'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    reserves: [{
        reserveId: {
            type: ObjectID,
            ref: 'Reserve',
            required: true
        },
    }],
    model: {
        type: String,
        required: true,
        trim: true
    },
    imgs: [{
        type: String,
        required: true,
        trim: true
    }],
    city: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isFree: {
        type: Boolean,
        required: true
    },
    freeFrom: {
        type: Date,
        required: true
    }
})

const Car = mongoose.model('Car', CarSchema);

module.exports = Car;