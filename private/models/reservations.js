const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    reservationNumber: {
        type: String,
        required: true
    },

    flightNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'flights',
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    email: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    passportCode: {
        type: String,
        required: true
    },

    seatNumber: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Cancelled', 'Waitlisted', 'Rescheduled'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('reservations', schema);