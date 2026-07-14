const Users = require('../models/Users');

async function createUser(data) {
    const user = new Users({
        emailAddress: data.emailAddress,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        passportCode: data.passportCode,
        role: data.role
    });

    return user.save();
}

module.exports = { createUser };