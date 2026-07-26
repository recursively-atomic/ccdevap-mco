const model = require('../models/flightModel');

async function getFlights(page, limit) {
    const skip = (page - 1) * limit;

    const totalFlights = await model.countDocuments();
    const flights = await model.find().sort({ 'createdAt': 1 }).skip(skip).limit(limit).lean();

    return { flights, totalFlights };
}

async function getFlight(flightID) {
    const flight = await model.findById(flightID).lean();

    return flight;
}

async function getLastFlight() {
    return await model.findOne().sort({ flightNumber: -1 }).select('flightNumber').lean();
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

// // Update a flight
// exports.updateFlight = async (req, res) => {
//     try {
//         const { flightNumber, origin, destination, departureDateTime, arrivalDateTime, flightStatus } = req.body;
//         const updated = await model.findByIdAndUpdate(
//             req.params.id,
//             { flightNumber, origin, destination, departureDateTime, arrivalDateTime, flightStatus },
//             { new: true, runValidators: true }
//         ).lean();
//         if (!updated) return res.status(404).json({ message: 'Flight not found' });
//         res.json(updated);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

function isEqual(a, b) {
    return a === b;
}

function isAirportEqual(a, b) {
    return a.iata === b.iata && a.location === b.location && a.name === b.name;
}

async function updateFlight(flightData) {
    const currentData = await getFlight(flightData._id);

    // make varaiblebe for the current and new data to make it less wide yung code hshs

    const updates = {};

    if (!isAirportEqual(flightData.originAirport, currentData.originAirport)) {
        updates.originAirport = flightData.originAirport;
    }

    if (!isAirportEqual(flightData.destinationAirport, currentData.destinationAirport)) {
        updates.destinationAirport = flightData.destinationAirport;
    }

    if (new Date(flightData.departureDatetime).getTime() !== new Date(currentData.departureDatetime).getTime()) {
        updates.departureDatetime = flightData.departureDatetime;
    }

    if (new Date(flightData.arrivalDatetime).getTime() !== new Date(currentData.arrivalDatetime).getTime()) {
        updates.arrivalDatetime = flightData.arrivalDatetime;
    }

    if (!isEqual(flightData.baseFare, currentData.baseFare)) {
        updates.baseFare = flightData.baseFare;
    }

    if (!isEqual(flightData.flightStatus, currentData.flightStatus)) {
        updates.flightStatus = flightData.flightStatus;
    }

    if (Object.keys(updates).length === 0) {
        return currentData;
    }

    return await model.findOneAndUpdate(
        { _id: flightData._id },
        { $set: updates },
    );
}

async function deleteFlight(flightID) {
    return await model.findByIdAndDelete(flightID);
}

module.exports = { getFlights, getFlight, getLastFlight, createFlight, updateFlight, deleteFlight };