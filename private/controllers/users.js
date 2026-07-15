const Users = require('../models/users');

async function createUser(data) {
    const user = new Users({
        emailAddress: data.emailAddress,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        passportCode: data.passportCode,
        role: data.role || "user"
    });

    return await user.save();
}

async function getUserById(id) {
    return await Users.findById(id);
}

// READ USING EMAIL (used for login)
async function getUserByEmail(email) {
    return await Users.findOne({
        emailAddress: email
    });
}

// READ ALL (Admin)
async function getAllUsers() {
    return await Users.find().sort({
        lastName: 1,
        firstName: 1
    });
}

// UPDATE
async function updateUser(id, data) {
    return await Users.findByIdAndUpdate(
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

async function changePassword(userId, currentPassword, newPassword) {
    const user = await Users.findById(userId);
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

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    changePassword
};