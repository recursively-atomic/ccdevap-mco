const model = require('../models/reservations');

async function createReservation(data) {
    const reservation = new model({
        reservationNumber: data.reservationNumber,
        flightNumber: data.flightNumber,
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passportCode: data.passportCode,
        seatNumber: data.seatNumber,
    });

    return reservation.save();
}

module.exports = { createReservation };