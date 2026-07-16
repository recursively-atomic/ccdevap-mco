const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true
    },
    airline: {
        type: String,
        default: 'Unknown'  // Not in HBS, but we provide a default
    },
    originAirport: {
        type: String,
        required: true
    },
    destinationAirport: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    arrivalDate: {
        type: Date,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
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
        default: 0          // Not in HBS, but we set a default
    },
    flightStatus: {
        type: String,
        enum: ['On Time', 'Delayed', 'Rescheduled', 'Cancelled'],
        default: 'On Time'
    }
});

module.exports = mongoose.model('flights', schema);
