const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    reservationNumber: {
        type: String,
        unique: true,
        required: true
    },

    flightNumber: {
        type: String,
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

    suffix: {
        type: String,
        required: false
    },

    passportCode: {
        type: String,
        required: true
    },

    seatNumber: {
        type: String,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Cancelled', 'Waitlisted', 'Rescheduled'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('reservations', schema);