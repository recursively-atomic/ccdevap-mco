const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    countryCode: {
        type: String,
        default: ""
    },

    passportCode: {
        type: String,
        default: ""
    },

    passportExpiration: {
        type: Date
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    suffix: {
        type: String,
        default: ""
    },

    birthDate: Date,

    gender: String,

    nationality: String,

    emailAddress: String,

    phoneNumber: String

}, {
    timestamps: true
});

module.exports = mongoose.model("Passengers", passengerSchema);