const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true
    },

    airline: {
        type: String,
        default: 'Unknown'
    },

    originAirport: {
        type: String,
        required: true
    },

    destinationAirport: {
        type: String,
        required: true
    },

    departureDatetime: {
        type: Date,
        required: true
    },

    arrivalDatetime: {
        type: Date,
        required: true
    },

    availableSeats: {
        type: Number,
        default: 16
    },

    layovers: {
        type: Number,
        default: 0
    },

    ticketPrice: {
        type: Number,
        default: 0
    },

    flightStatus: {
        type: String,
        enum: ['On Time', 'Delayed', 'Rescheduled', 'Cancelled'],
        default: 'On Time'
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('flights', schema);
