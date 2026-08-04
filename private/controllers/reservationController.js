const model = require('../models/reservationModel');
const flight = require('../models/flightModel');

async function createReservation(reservationData) {
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

    await flight.findOneAndUpdate({ flightNumber: reservationData.flightNumber, availableSeats: { $gt: 0 } }, { $inc: { availableSeats: -1 } });
    return reservation.save();
}

async function readSeatMap(flightNumber) {
    const reservations = await model.find({ flightNumber, status: { $nin: ['Cancelled', 'Completed'] } }).select('seatNumber').lean();
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

async function readReservation(identifier) {
    const reservation = await model.findOne({ identifier }).lean();
    const flightData = await flight.findOne({ flightNumber: reservation.flightNumber }).lean();
    const { flightNumber, ...rest } = reservation;

    return { ...rest, flight: flightData };
}

async function readReservations(page, limit, userNumber = null) {
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

module.exports = { createReservation, readSeatMap, readReservation, readReservations, updateSeat, updateStatus };
