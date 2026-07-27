const model = require('../models/userModel');

async function getUserById(id) {
    return await model.findById(id).lean();
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

// UPDATE USER INFORMATION
async function updateUser(id, data) {
    // make it like updateFlight
    return await model.findByIdAndUpdate(
        id,
        {
            $set: {
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.emailAddress,
                contactNumber: data.contactNumber
            }
        },
        { returnDocument: "after" }
    );
}

async function updatePassword(userId, currentPassword, newPassword) {
    const user = await model.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }

    if (user.password !== currentPassword) {
        throw new Error("Current password is incorrect.");
    }

    user.password = newPassword;
    return await user.save();
}

module.exports = { getUserById, getUserByEmail, getLastUserNumber, getUsers, createUser, updateUser, updatePassword };