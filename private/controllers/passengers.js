const Passengers = require("../models/Passengers");

async function createPassenger(data) {
    return await Passengers.create(data);
}

async function getPassengersByUser(userId) {
    return await Passengers.find({ userId });
}

async function getPassenger(id) {
    return await Passengers.findById(id);
}

async function updatePassenger(id, data) {

    return await Passengers.findByIdAndUpdate(
        id,
        data,
        {
            new: true
        }
    );

}

async function deletePassenger(id) {
    return await Passengers.findByIdAndDelete(id);
}

module.exports = {
    createPassenger,
    getPassengersByUser,
    getPassenger,
    updatePassenger,
    deletePassenger
};