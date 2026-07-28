const model = require('../models/userModel');

async function getUser(userNumber) {
    return await model.findOne({ userNumber: userNumber }).lean();
}

async function getUserByEmail(email) {
    return await model.findOne({ emailAddress: email }).lean();
}

async function getLastUserNumber() {
    return await model.findOne().sort({ userNumber: -1 }).select('userNumber').lean();
}

async function getUsers(page, limit) {
    const skip = (page - 1) * limit;

    const totalUsers = await model.countDocuments();
    const users = await model.find().sort({ userNumber: 1 }).skip(skip).limit(limit).lean();

    return { users, totalUsers };
}

/**
 * Creates a single user once a user registers.
 * 
 * @param {Object} userData is an object containing all of the user input.
 * @returns {Promise} the status of the creation of the document.
 */
async function createUser(userData) {
    const user = new model({
        userNumber: userData.userNumber,
        emailAddress: userData.emailAddress,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user'
    });

    return await user.save();
}

async function updateUser(userData) {
    const currentData = await getUser(userData.userNumber);

    const newFirstName = userData.firstName;
    const newLastName = userData.lastName;
    const newEmailAddress = userData.emailAddress;
    const newContactNumber = userData.contactNumber ? userData.contactNumber.trim() : '';

    const updates = {};

    if (newFirstName.trim() !== currentData.firstName) {
        updates.firstName = newFirstName.trim()
    }

    if (newLastName.trim() !== currentData.lastName) {
        updates.lastName = newLastName.trim();
    }

    if (newEmailAddress.trim() !== currentData.emailAddress) {
        updates.emailAddress = newEmailAddress.trim();
    }

    if (newContactNumber.trim() !== currentData.contactNumber) {
        updates.contactNumber = newContactNumber.trim();
    }

    if (Object.keys(updates).length === 0) {
        return currentData;
    }

    const updatedUser = await model.findOneAndUpdate(
        { userNumber: userData.userNumber },
        { $set: updates },
        { returnDocument: "after" }
    ).lean();

    return updatedUser;
};

async function updatePassword(userData) {
    const user = await model.findOne({ userNumber: userData.userNumber });

    if (userData.currentPassword === user.password) {
        user.password = userData.newPassword;
    }

    return await user.save();
}

module.exports = { getUser, getUserByEmail, getLastUserNumber, getUsers, createUser, updateUser, updatePassword };