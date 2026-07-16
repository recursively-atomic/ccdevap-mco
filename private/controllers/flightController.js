let flights = [];

exports.getFlights = (req, res) => {
    res.json(flights);
};

exports.getFlight = (req, res) => {
    const id = Number(req.params.id);
    const flight = flights.find(f => f.id === id);
    if (!flight) {
        return res.status(404).json({
            message: "Flight not found"
        });
    }
    res.json(flight);
}

exports.createFlight = (req, res) => {
    const newFlight = {
        id: flights.length + 1,
        flightNumber: req.body.flightNumber,
        origin: req.body.origin,
        destination: req.body.destination,
        departureDateTime: req.body.departureDateTime,
        arrivalDateTime: req.body.arrivalDateTime,
        flightStatus: req.body.flightStatus,
        capacityStatus: req.body.capacityStatus
    };
    flights.push(newFlight);
    res.status(201).json({
        message: "Flight added successfully!",
        flight: newFlight
    });
};

exports.updateFlight = (req, res) => {
    const id = Number(req.params.id);
    const flight = flights.find(f => f.id === id);
    if (!flight) {
        return res.status(404).json({
            message: "Flight not found"
        });
    }
    flight.flightNumber = req.body.flightNumber;
    flight.origin = req.body.origin;
    flight.destination = req.body.destination;
    flight.departureDateTime = req.body.departureDateTime;
    flight.arrivalDateTime = req.body.arrivalDateTime;
    flight.flightStatus = req.body.flightStatus;
    flight.capacityStatus = req.body.capacityStatus;
    res.json({
        message: "Flight updated successfully",
        flight
    });
}

exports.deleteFlight = (req, res) => {
    const id = Number(req.params.id);
    const index = flights.findIndex(f => f.id === id);
    if (index === -1) {
        return res.status(404).json({
            message: "Flight not found"
        });
    }
    flights.splice(index, 1);
    res.json({
        message: "Flight deleted"
    });
};