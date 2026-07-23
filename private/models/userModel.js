const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    emailAddress: {
        type: String,
        unique: true,
        required: true
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
        default: ""
    },

    passportCode: {
        type: String
    },

    role: {
        type: String,
        default: "user",
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('users', userSchema);