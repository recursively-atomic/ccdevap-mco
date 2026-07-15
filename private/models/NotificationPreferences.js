const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        unique: true
    },

    flightEmail: Boolean,
    flightSMS: Boolean,

    gateEmail: Boolean,
    gateSMS: Boolean,

    checkInEmail: Boolean,
    checkInSMS: Boolean,

    boardingEmail: Boolean,
    boardingSMS: Boolean,

    dealsEmail: Boolean,
    dealsSMS: Boolean,

    partnerEmail: Boolean,
    partnerSMS: Boolean,

    subscribeAllEmail: Boolean,
    subscribeAllSMS: Boolean

});

module.exports = mongoose.model("NotificationPreference",notificationPreferenceSchema);