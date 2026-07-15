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

    passportCode: {
        type: String
    },
    
    role: {
        type: String,
        default:"user",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);