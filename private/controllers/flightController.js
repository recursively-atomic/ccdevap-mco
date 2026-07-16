const model = require('../models/flightModel');

// Get all flights
exports.getFlights = async (req, res) => {
    try {
        const flights = await model.find().lean();
        // Add computed capacityStatus
        const result = flights.map(f => ({
            ...f,
            capacityStatus: f.availableSeats > 0 ? 'Available' : 'Full'
        }));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single flight
exports.getFlight = async (req, res) => {
    try {
        const flight = await model.findById(req.params.id).lean();
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        res.json({
            ...flight,
            capacityStatus: flight.availableSeats > 0 ? 'Available' : 'Full'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a flight
exports.createFlight = async (req, res) => {
    try {
        const { flightNumber, origin, destination, departureDateTime, arrivalDateTime, flightStatus } = req.body;
        const newFlight = new model({
            flightNumber,
            origin,
            destination,
            departureDateTime,
            arrivalDateTime,
            flightStatus: flightStatus || 'On Time',
            // These will use defaults from schema
        });
        const saved = await newFlight.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

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