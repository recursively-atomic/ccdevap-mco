const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // email-ddress
    // password
    // first-name
    // last-name
    // passport-code
    // role (admin or client)
});

const Users = mongoose.model('users', schema);
module.exports = Users;