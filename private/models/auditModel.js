const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userNumber: {
        type: Number,
        required: true
    },
    
    userName: {
        type: String,
        required: true
    },

    newUserName: {
        type: String,
        required: false
    },

    userEmail: {
        type: String,
        required: false
    },

    userRole: {
        type: String,
        required: true
    },

    flightAirline: {
        type: String,
        required: false
    },

    flightNumber: {
        type: Number,
        required: false
    },

    flightRoute: {
        origin: {
            airport: {
                type: String,
                required: false
            },

            datetime: {
                type: Date,
                required: false
            }
        },

        destination: {
            airport: {
                type: String,
                required: false
            },

            datetime: {
                type: Date,
                required: false
            }
        }
    },

    flightStatus: {
        type: String,
        required: false
    },

    reservationIdentifier: {
        type: String,
        required: false
    },

    reservationSeat: {
        type: String,
        required: false
    },

    newReservationSeat: {
        type: String,
        required: false
    },

    action: {
        type: String,
        enum: ['u-reg', 'u-lin', 'u-upd', 'u-lot', 'f-cre', 'f-upd', 'f-del', 'r-cre', 'r-upd', 'r-can'],
        required: true
    }
},
    {
        timestamps: {
            createdAt: 'timestamp',
            updatedAt: false
        }
    }
);

module.exports = mongoose.model('audits', schema);