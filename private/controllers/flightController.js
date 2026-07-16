const model = require('../models/flightModel');

// Get all flights
exports.getFlights = async (req, res) => {
    try {
        const flights = await model.find().lean();
        res.json(flights);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single flight by ID
exports.getFlight = async (req, res) => {
    try {
        const flight = await model.findById(req.params.id).lean();
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        res.json(flight);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new flight
exports.createFlight = async (req, res) => {
    try {
        const {
            flightNumber,
            airline,
            origin,
            destination,
            departureDateTime,
            arrivalDateTime,
            availableSeats,
            layovers,
            ticketPrice,
            flightStatus
        } = req.body;

        const newFlight = new model({
            flightNumber,
            airline,
            origin,
            destination,
            departureDateTime,
            arrivalDateTime,
            availableSeats: availableSeats || 16,
            layovers: layovers || 0,
            ticketPrice,
            flightStatus: flightStatus || 'On Time'
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
        const updated = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
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