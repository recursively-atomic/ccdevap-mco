const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // email-ddress
    // password
    // first-name
    // last-name
    // passport-code
    // role (admin or client)
});

module.exports = mongoose.model('users', schema);