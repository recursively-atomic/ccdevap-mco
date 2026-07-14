const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    emailAddress: {
        type: String,
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
        type: String,
        unique: true,
        required: true
    },
    
    role: {
        type: String,
        enum: ['admin', 'client'],
        required: true
    }
});

module.exports = mongoose.model('users', schema);