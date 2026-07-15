const model = require('../models/reservations');

/**
 * Creates a seat map of a specific flight that keeps track of
 * seat availability.
 * 
 * @param {String} flightNumber the specific flight to create a seat map of.
 * @returns {Object} the seat map.
 */
async function getSeatMap(flightNumber) {
    const reservations = await model.find({ flightNumber, status: { $ne: 'Cancelled' } }).select('seatNumber').lean();
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
 * Gets all of the reservations that are associated to a certain user or not and
 * limits the results according to the `limit` parameter.
 * 
 * @param {Number} page the page of the reservation results.
 * @param {Number} limit the maximum amount of reservations that can be displayed per page.
 * @param {String} userId an optional specific user.
 * @returns {[Object, Number]} the reservations and the total amount of reservations.
 */
async function getReservations(page, limit, userId = null) {
    const skip = (page - 1) * limit;
    const filter = userId ? { userId } : {};

    const totalReservations = await model.countDocuments(filter);
    const reservations = await model.find(filter).sort({ 'reservationNumber': 1 }).skip(skip).limit(limit).lean();

    return { reservations, totalReservations };
}

/**
 * Creates a single reservation from user inputs in
 * `booking.hbs` and `booking.js`.
 * 
 * @param {Object} reservationData is an object containing all of the user input.
 * @returns {Promise} the status of the creation of the document.
 */
async function createReservation(reservationData) {
    const reservation = new model({
        reservationNumber: reservationData.reservationNumber,
        flightNumber: reservationData.flightNumber,
        userId: reservationData.userId,
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
 * Updates the seat associated to a certain reservation.
 * 
 * @param {String} reservationNumber the reservation to be updated.
 * @param {String} newSeat the new selected seat to be associated to the reservation.
 * @returns {Promise} the status after updating the document.
 */
async function updateSeat(reservationNumber, newSeat) {
    return await model.findOneAndUpdate(
        { reservationNumber },
        { seatNumber: newSeat }
    );
}

/**
 * Updates the status of a reservation.
 * 
 * @param {String} reservationNumber the reservation to be updated.
 * @param {String} newStatus the new status of the reservation.
 * @returns {Promise} the status after updating the document.
 */
async function updateStatus(reservationNumber, newStatus) {
    return await model.findOneAndUpdate(
        { reservationNumber },
        { status: newStatus }
    );
}

module.exports = { getSeatMap, getReservations, createReservation, updateSeat, updateStatus };