const NotificationPreference =
    require("../models/NotificationPreference");

async function getPreferences(userId) {
    return await NotificationPreference.findOne({ userId });
}

async function savePreferences(userId, data) {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        data,
        {
            upsert: true,
            new: true
        }
    );
}

module.exports = { getPreferences, savePreferences };