const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userNumber: {
        type: Number,
        required: true,
        unique: true,
    },

    emailAddress: {
        type: String,
        required: true,
        unique: true
    },

    password: {
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

    contactNumber: {
        type: String,
    },

    passportCode: {
        type: String
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: "user"
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('users', userSchema);