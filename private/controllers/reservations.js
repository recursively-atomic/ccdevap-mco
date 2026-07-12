const model = require('../models/reservations');

function createReservation(flight = '507f1f77bcf86cd799439011', user = '507f1f77bcf86cd799439012') {
    const reservation = new model({
        reservationNumber: 'RSV-1001',
        flightNumber: flight,
        userId: user,
        email: 'womp@womp.com',
        firstName: 'Ana',
        lastName: 'Santos',
        passportCode: 'WOMP',
        seatNumber: '14B'
    });

    reservation.save();
    return reservation;
}

module.exports = { createReservation };