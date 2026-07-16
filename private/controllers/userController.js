const model = require('../models/userModel');

//GETS USER BY ID
async function getUserById(id) {
    return await model.findById(id);
}

// READ USING EMAIL (used for login)
async function getUserByEmail(email) {
    return await model.findOne({
        emailAddress: email
    });
}

// READ ALL (Admin)
async function getAllUsers() {
    return await model.find().sort({
        lastName: 1,
        firstName: 1
    });
}

/**
 * Creates a single user once user registers.
 * 
 * @param {Object} data is an object containing all of the user input.
 * @returns {Promise} the status of the creation of the document.
 */
async function createUser(data) {
    const user = new model({
        emailAddress: data.emailAddress,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        passportCode: data.passportCode,
        role: data.role || "user"
    });

    return await user.save();
}

// UPDATE USER INFORMATION
async function updateUser(id, data) {
    return await model.findByIdAndUpdate(
        id,
        {
            firstName: data.firstName,
            lastName: data.lastName,
            emailAddress: data.emailAddress,
            contactNumber: data.contactNumber
        },
        {
            new: true
        }
    );
}

//CHANGE PASSWORD
async function changePassword(userId, currentPassword, newPassword) {
    const user = await model.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    if (user.password !== currentPassword) {
        throw new Error("Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save();
    return user;
}

module.exports = { getUserById, getUserByEmail, getAllUsers, createUser, updateUser, changePassword };