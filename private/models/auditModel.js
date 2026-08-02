const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: false
    },

    userRole: {
        type: String,
        required: true
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

    reservationIdentifier: {
        type: String,
        required: false
    },

    reservationSeat: {
        type: String,
        required: false
    },

    action: {
        type: String,
        enum: ['u-reg', 'u-lin', 'u-lot', 'f-cre', 'f-upd', 'f-del', 'r-cre', 'r-upd', 'r-can'],
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