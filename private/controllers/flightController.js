const model = require('../models/flightModel');

async function getFlights(page, limit) {
    const skip = (page - 1) * limit;

    const totalFlights = await model.countDocuments();
    const flights = await model.find().sort({ 'createdAt': 1 }).skip(skip).limit(limit).lean();

    return { flights, totalFlights };
}

// exports.getFlight = async (req, res) => {
//     try {
//         const flight = await model.findById(req.params.id).lean();
//         if (!flight) return res.status(404).json({ message: 'Flight not found' });
//         res.json({
//             ...flight,
//             capacityStatus: flight.availableSeats > 0 ? 'Available' : 'Full'
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

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

// Update a flight
exports.updateFlight = async (req, res) => {
    try {
        const { flightNumber, origin, destination, departureDateTime, arrivalDateTime, flightStatus } = req.body;
        const updated = await model.findByIdAndUpdate(
            req.params.id,
            { flightNumber, origin, destination, departureDateTime, arrivalDateTime, flightStatus },
            { new: true, runValidators: true }
        ).lean();
        if (!updated) return res.status(404).json({ message: 'Flight not found' });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a flight
exports.deleteFlight = async (req, res) => {
    try {
        const deleted = await model.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Flight not found' });
        res.json({ message: 'Flight deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getFlights, getLastFlight, createFlight };