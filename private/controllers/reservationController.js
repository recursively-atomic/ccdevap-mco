const model = require('../models/reservationModel');
const flight = require('../models/flightModel');

/**
 * Creates a seat map of a specific flight that keeps track of
 * seat availability.
 * 
 * @param {Number} identifier the specific flight to create a seat map of.
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

async function getReservation(identifier) {
    const reservation = await model.findOne({ identifier }).lean();
    const flightData = await flight.findOne({ flightNumber: reservation.flightNumber }).lean();
    const { flightNumber, ...rest } = reservation;
    
    return { ...rest, flight: flightData };
}

async function getReservations(page, limit, userNumber = null) {
    const skip = (page - 1) * limit;
    const filter = userNumber ? { userNumber } : {};

    const totalReservations = await model.countDocuments(filter);
    const reservations = await model.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean();

    const flightNumbers = [...new Set(reservations.map(reservation => reservation.flightNumber))];
    const flights = await flight.find({ flightNumber: { $in: flightNumbers } }).lean();
    const flightMap = new Map(flights.map(flight => [flight.flightNumber, flight]));

    const reservationsWithFlights = reservations.map(reservation => {
        const { flightNumber, ...rest } = reservation;

        return { ...rest, flight: flightMap.get(flightNumber) };
    });

    return { reservations: reservationsWithFlights, totalReservations };
}

/**
 * Creates a single reservation from user inputs in
 * `booking.hbs` and `booking.js`.
 * 
 * @param {Object} reservationData is an object containing all of the user input.
 * @returns {Promise} the status of the creation of the document.
 */
async function createReservation(reservationData) {
    const updatedFlight = await flight.findOneAndUpdate({ flightNumber: reservationData.flightNumber, availableSeats: { $gt: 0 } }, { $inc: { availableSeats: -1 } });
    const reservation = new model({
        identifier: reservationData.identifier,
        flightNumber: reservationData.flightNumber,
        userNumber: reservationData.userNumber,
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
async function updateSeat(identifier, newSeat) {
    return await model.findOneAndUpdate(
        { identifier },
        { seatNumber: newSeat }
    );
}

async function updateStatus(identifier, newStatus) {
    const reservation = await model.findOne({ identifier });

    if (newStatus === 'Cancelled') {
        await flight.findOneAndUpdate({ flightNumber: reservation.flightNumber }, { $inc: { availableSeats: 1 } });
    }

    return await model.findOneAndUpdate(
        { identifier },
        { status: newStatus }
    );
}

module.exports = { getSeatMap, getReservation, getReservations, createReservation, updateSeat, updateStatus };
