const model = require('../models/flightModel');

async function createFlight(flightData) {
    const flight = new model({
        flightNumber: flightData.flightNumber,
        airline: flightData.airline,

        originAirport: {
            iata: flightData.originAirport.iata,
            location: flightData.originAirport.location,
            name: flightData.originAirport.name
        },

        destinationAirport: {
            iata: flightData.destinationAirport.iata,
            location: flightData.destinationAirport.location,
            name: flightData.destinationAirport.name
        },

        departureDatetime: flightData.departureDatetime,
        arrivalDatetime: flightData.arrivalDatetime,
        baseFare: flightData.baseFare
    });

    return flight.save();
}

async function readFlight(flightNumber) {
    return await model.findOne({ flightNumber: flightNumber }).lean();
}

async function readLastFlightNumber() {
    return await model.findOne().sort({ flightNumber: -1 }).select('flightNumber').lean();
}

async function readFlightOrigins() {
    return await model.aggregate([
        {
            $group: {
                _id: '$originAirport.iata',
                iata: { $first: '$originAirport.iata' },
                location: { $first: '$originAirport.location' },
                name: { $first: '$originAirport.name' }
            }
        },
        { $project: { _id: 0, iata: 1, location: 1, name: 1 } },
        { $sort: { iata: 1 } }
    ]);
}

async function readFlightDestinations() {
    return await model.aggregate([
        {
            $group: {
                _id: '$destinationAirport.iata',
                iata: { $first: '$destinationAirport.iata' },
                location: { $first: '$destinationAirport.location' },
                name: { $first: '$destinationAirport.name' }
            }
        },
        { $project: { _id: 0, iata: 1, location: 1, name: 1 } },
        { $sort: { iata: 1 } }
    ]);
}

async function readFlightsByQuery(queryData, page, limit) {
    const skip = (page - 1) * limit, filter = { status: { $nin: ['In Air', 'Cancelled', 'Completed'] } };
    let totalFlights, flights;

    if (queryData.departureIata) {
        filter['originAirport.iata'] = queryData.departureIata;
    }

    if (queryData.arrivalIata) {
        filter['destinationAirport.iata'] = queryData.arrivalIata;
    }

    if (queryData.departuredate) {
        const dayStart = new Date(queryData.departuredate);
        const dayEnd = new Date(queryData.departuredate);

        dayStart.setUTCHours(0, 0, 0, 0);
        dayEnd.setUTCHours(23, 59, 59, 999);
        filter.departureDatetime = { $gte: dayStart, $lte: dayEnd };
    }

    totalFlights = await model.countDocuments(filter);
    flights = await model.find(filter).skip(skip).limit(limit).lean();

    return { flights, totalFlights };
}

async function readFlights(page, limit) {
    const skip = (page - 1) * limit;

    const totalFlights = await model.countDocuments();
    const flights = await model.find().sort({ flightNumber: 1 }).skip(skip).limit(limit).lean();

    return { flights, totalFlights };
}

function isEqualAirports(a, b) {
    return a.iata === b.iata && a.location === b.location && a.name === b.name;
}

async function updateFlight(flightData) {
    const currentData = await getFlight(flightData.flightNumber);

    const currentOrigAirport = currentData.originAirport;
    const newOrigAirport = flightData.originAirport;
    const currentDestAirport = currentData.destinationAirport;
    const newDestAirport = flightData.destinationAirport;

    const currentDeptDt = new Date(currentData.departureDatetime).getTime();
    const newDeptDt = new Date(flightData.departureDatetime).getTime();
    const currentArrDt = new Date(currentData.arrivalDatetime).getTime();
    const newArrDt = new Date(flightData.arrivalDatetime).getTime();

    const currentBf = currentData.baseFare;
    const newBf = flightData.baseFare;
    const currentStatus = currentData.status;
    const newStatus = flightData.status;

    const updates = {};

    if (!isEqualAirports(newOrigAirport, currentOrigAirport)) {
        updates.originAirport = newOrigAirport;
    }

    if (!isEqualAirports(newDestAirport, currentDestAirport)) {
        updates.destinationAirport = newDestAirport;
    }

    if (newDeptDt !== currentDeptDt) {
        updates.departureDatetime = flightData.departureDatetime;
    }

    if (newArrDt !== currentArrDt) {
        updates.arrivalDatetime = flightData.arrivalDatetime;
    }

    if (newBf !== currentBf) {
        updates.baseFare = newBf;
    }

    if (newStatus !== currentStatus) {
        updates.status = newStatus;
    }

    if (Object.keys(updates).length === 0) {
        return currentData;
    }

    return await model.findOneAndUpdate(
        { flightNumber: flightData.flightNumber },
        { $set: updates },
        { returnDocument: "after" }
    ).lean();
}

async function deleteFlight(flightNumber) {
    return await model.findOneAndDelete({ flightNumber: flightNumber });
}

module.exports = { createFlight, readFlight, readLastFlightNumber, readFlightOrigins, readFlightDestinations, readFlightsByQuery, readFlights, updateFlight, deleteFlight };