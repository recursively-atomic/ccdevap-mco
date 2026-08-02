const model = require('../models/auditModel');

async function createAudit(auditData) {
    const user = new model({
        userName: auditData.userName,
        userEmail: auditData.userEmail,
        userRole: auditData.userRole,
        flightNumber: auditData.flightNumber,

        flightRoute: {
            origin: {
                airport: auditData.airport,
                datetime: auditData.datetime,
            },

            destination: {
                airport: auditData.airport,
                datetime: auditData.datetime,
            }
        },

        reservationIdentifier: auditData.reservationIdentifier,
        reservationSeat: auditData.reservationSeat,
        action: auditData.action,
    });

    return await user.save();
}

module.exports = { createAudit };