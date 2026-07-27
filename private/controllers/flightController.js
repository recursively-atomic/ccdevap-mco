const model = require('../models/flightModel');

async function getFlight(flightID) {
    const flight = await model.findById(flightID).lean();

    return flight;
}

async function getLastFlightNumber() {
    return await model.findOne().sort({ flightNumber: -1 }).select('flightNumber').lean();
}

async function getFlightOrigins() {
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

async function getFlightDestinations() {
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

async function getFlightsByQuery() {
    
}

async function getFlights(page, limit) {
    const skip = (page - 1) * limit;

    const totalFlights = await model.countDocuments();
    const flights = await model.find().sort({ flightNumber: 1 }).skip(skip).limit(limit).lean();

    return { flights, totalFlights };
}

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

function isEqualAirports(a, b) {
    return a.iata === b.iata && a.location === b.location && a.name === b.name;
}

async function updateFlight(flightData) {
    const flightID = flightData._id;
    const currentData = await getFlight(flightID);

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
    const currentStatus = currentData.flightStatus;
    const newStatus = flightData.flightStatus;

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

    if (!(newBf === currentBf)) {
        updates.baseFare = newBf;
    }

    if (!(newStatus === currentStatus)) {
        updates.flightStatus = newStatus;
    }

    if (Object.keys(updates).length === 0) {
        return currentData;
    }

    return await model.findByIdAndUpdate(
        flightID,
        { $set: updates },
        { returnDocument: "after" }
    ).lean();
}

async function deleteFlight(flightID) {
    return await model.findByIdAndDelete(flightID);
}

module.exports = { getFlight, getLastFlightNumber, getFlightOrigins, getFlightDestinations, getFlightsByQuery, getFlights, createFlight, updateFlight, deleteFlight };