const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    method: String,

    cardHolderFirstName: String,
    cardHolderLastName: String,

    receiptEmail: String,

    billingCountry: String,
    billingRegion: String,
    zipCode: String,

    cardNumber: String,
    expirationDate: String,
    cvn: String,

    billingAddress1: String,
    billingAddress2: String,

    accountName: String,
    accountNumber: String

});

module.exports = mongoose.model("Payments", paymentSchema);