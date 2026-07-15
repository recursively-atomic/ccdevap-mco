const model = require('../models/reservations');

/**
 * Creates a seat map of a specific flight that keeps track of
 * seat availability.
 * 
 * @param {*} flightNumber the specific flight to create a seat map of.
 * 
 * @returns the seat map.
 */
async function getSeatMap(flightNumber) {
    const reservations = await model.find({ flightNumber }).select('seatNumber').lean();
    const reservedSeats = reservations.map(reservation => reservation.seatNumber);

    const rows = ['A', 'B', 'C', 'D'];
    const cols = [1, 2, 3, 4];
    const classes = { A: 'first-class', B: 'business', C: 'premium', D: 'economy' };

    const seatMap = rows.map(row =>
        cols.map(col => {
            const seatNumber = `${row}${col}`;

            return {
                number: seatNumber,
                class: classes[row],
                occupied: reservedSeats.includes(seatNumber)
            };
        })
    );

    return seatMap;
}

/**
 * Creates a single reservation from user inputs in
 * `booking.hbs` and `booking.js`.
 * 
 * @param {Object} reservationData is an object containing all of the user input.
 * 
 * @returns {Promise} the status of the creation of the document.
 */
async function createReservation(reservationData) {
    const reservation = new model({
        reservationNumber: reservationData.reservationNumber,
        flightNumber: reservationData.flightNumber,
        email: reservationData.email,
        firstName: reservationData.firstName,
        lastName: reservationData.lastName,
        suffix: reservationData.suffix,
        passportCode: reservationData.passportCode,
        seatNumber: reservationData.seatNumber,
        totalAmount: reservationData.totalAmount
    });

    return reservation.save();
}

/**
 * Gets all reservations of a user using their email.
 */
async function getReservationsByEmail(email) {
    return await model.find({
        email: email
    }).sort({
        reservationNumber: -1
    });
}

/**
 * Gets one reservation.
 */
async function getReservationById(id) {
    return await model.findById(id);
}

// readReservation
// updateSeatSelection
// updateStatus

module.exports = { getSeatMap, createReservation, getReservationsByEmail, getReservationById };