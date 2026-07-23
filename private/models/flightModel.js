const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
        unique: true,
    },

    airline: {
        type: String,
        required: true,
        enum: ['Cebu Atlantic', 'Filipino Airlines', 'AirFAST', 'Sunray Air'],
    },

    originAirport: {
        iata: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        }
    },

    destinationAirport: {
        iata: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        }
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

    baseFare: {
        type: Number,
        default: 0
    },

    flightStatus: {
        type: String,
        enum: ['Scheduled', 'In Air', 'Delayed', 'Rescheduled', 'Cancelled'],
        default: 'Scheduled'
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('flights', schema);