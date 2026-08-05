const model = require('../models/userModel');

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

async function readUser(userNumber) {
    return await model.findOne({ userNumber: userNumber }).lean();
}

async function readUserByEmail(email) {
    return await model.findOne({ emailAddress: email }).lean();
}

async function readLastUserNumber() {
    return await model.findOne().sort({ userNumber: -1 }).select('userNumber').lean();
}

async function readUsers(page, limit) {
    const skip = (page - 1) * limit;

    const totalUsers = await model.countDocuments();
    const users = await model.find().sort({ userNumber: 1 }).skip(skip).limit(limit).lean();

    return { users, totalUsers };
}

async function updateUser(userData) {
    const currentData = await readUser(userData.userNumber);

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
    const currentData = await readUser(userData.userNumber);
    
    if (userData.currentPassword !== currentData.password) {
        return currentData;
    }

    return await model.findOneAndUpdate(
        { userNumber: userData.userNumber },
        { password: userData.newPassword },
        { returnDocument: "after" }
    ).lean();
}

module.exports = { createUser, readUser, readUserByEmail, readLastUserNumber, readUsers, updateUser, updatePassword };