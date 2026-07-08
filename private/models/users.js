const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // emailAddress
    // password
    // firstName
    // lastName
    // passportCode
    // role (admin or client)
});

module.exports = mongoose.model('users', schema);