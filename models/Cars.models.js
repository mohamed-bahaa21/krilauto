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
    imgs: [{
        type: String,
        required: false,
        trim: true
    }],
    city: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true,
        trim: true
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
        required: true,
        default: true
    },
    freeFrom: {
        type: String,
        required: true,
        default: "Now"
    }
})

const Car = mongoose.model('Car', CarSchema);

module.exports = Car;