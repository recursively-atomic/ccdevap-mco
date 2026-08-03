const model = require('../models/auditModel');

async function createAudit(auditData) {
    const user = new model({
        userNumber: auditData.userNumber,
        userName: auditData.userName,
        newUserName: auditData.newUserName,
        userEmail: auditData.userEmail,
        userRole: auditData.userRole,
        flightAirline: auditData.flightAirline,
        flightNumber: auditData.flightNumber,

        flightRoute: {
            origin: {
                airport: auditData.flightRoute?.origin.airport,
                datetime: auditData.flightRoute?.origin.datetime,
            },

            destination: {
                airport: auditData.flightRoute?.destination.airport,
                datetime: auditData.flightRoute?.destination.datetime,
            }
        },

        flightStatus: auditData.flightStatus,
        reservationIdentifier: auditData.reservationIdentifier,
        reservationSeat: auditData.reservationSeat,
        newReservationSeat: auditData.newReservationSeat,
        action: auditData.action,
    });

    return await user.save();
}

async function readAudits(page, limit) {
    const skip = (page - 1) * limit;

    const totalAudits = await model.countDocuments();
    const audits = await model.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean();

    return { audits, totalAudits };
}

module.exports = { createAudit, readAudits };