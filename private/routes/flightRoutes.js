const express = require("express");
const router = express.Router();

const { getFlights, getLastFlight, createFlight } = require('../controllers/flightController');

router.get('/flight-search', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    res.render('flight-search', {
        page: '/flight-search',
        script: '/scripts/user/search.js',
        role: req.session.user.role,
    });
});

// router.get('/api/search', async (req, res) => {
//     const { originAirport, destinationAirport, departureDate } = req.query;

//     // Build a dynamic MongoDB query object
//     let query = {};

//     if (originAirport) query.originAirport = originAirport;
//     if (destinationAirport) query.destinationAirport = destinationAirport;
//     if (departureDate) {
//         // Match the exact day in MongoDB regardless of time
//         const start = new Date(departureDate);
//         start.setUTCHours(0, 0, 0, 0);
//         const end = new Date(departureDate);
//         end.setUTCHours(23, 59, 59, 999);
//         query.departureDate = { $gte: start, $lte: end };
//     }

//     if (status) query.status = status;

//     if (startDate || endDate) {
//         query.date = {};
//         if (startDate) query.date.$gte = new Date(startDate);
//         if (endDate) query.date.$lte = new Date(endDate);
//     }

//     try {
//         // Assuming you are using Mongoose
//         const results = await flights.find(query);
//         res.json(results);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

router.get('/flights', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/home");
    }

    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { flights, totalFlights } = await getFlights(page, limit);
        const totalPages = Math.ceil(totalFlights / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/flights?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalFlights,
            resultsPerPage: limit,
            baseUrl: '/flights?page='
        };

        res.status(200).render('flights', {
            page: '/flights',
            script: '/scripts/admin/flights.js',
            role: req.session.user.role,
            flightRows: flights,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.post('/flights', async (req, res) => {
    try {
        const lastFlight = await getLastFlight();
        const newFlightNumber = lastFlight ? lastFlight.flightNumber + 1 : 1;
        const flightData = {
            flightNumber: newFlightNumber,
            airline: req.body['airline'],
            originAirport: {
                iata: req.body['origin-iata'],
                location: req.body['origin-location'],
                name: req.body['origin-name']
            },
            destinationAirport: {
                iata: req.body['destination-iata'],
                location: req.body['destination-location'],
                name: req.body['destination-name']
            },
            departureDatetime: new Date(req.body['departure-datetime'] + 'Z'),
            arrivalDatetime: new Date(req.body['arrival-datetime'] + 'Z'),
            baseFare: Number(req.body['base-fare'])
        };

        await createFlight(flightData);
        res.status(200).json({ success: true, flightNumber: newFlightNumber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.get('/api/flights-table', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { flights, totalFlights } = await getFlights(page, limit);
        const totalPages = Math.ceil(totalFlights / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/flights?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalFlights,
            resultsPerPage: limit,
            baseUrl: '/flights?page='
        };

        res.status(200).render('flights', {
            page: '/flights',
            script: '/scripts/admin/flights.js',
            role: req.session.user.role,
            flightRows: flights,
            pagination: pagination
        });
    } catch (err) {
        console.error(err);
        res.status(500);
    }
});

// Get ONE flight
// router.get("/api/flights/:id", flightController.getFlight);

// // Create new flight
// router.post("/api/flights", flightController.createFlight);

// // Update a flight
// router.put("/api/flights/:id", flightController.updateFlight)

// // Delete a flight
// router.delete("/api/flights/:id", flightController.deleteFlight);

module.exports = router;