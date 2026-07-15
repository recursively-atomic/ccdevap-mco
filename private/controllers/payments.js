const Payments = require("../models/Payments");

async function createPayment(data) {

    const payment = new Payments(data);

    return await payment.save();

}

async function getPaymentByUser(userId) {

    return await Payments.findOne({
        userId
    });

}

async function updatePayment(id, data) {

    return await Payments.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );

}

module.exports = {

    createPayment,
    getPaymentByUser,
    updatePayment

};