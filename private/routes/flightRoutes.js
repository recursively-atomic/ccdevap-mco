const express = require('express');
const router = express.Router();

const {
    getFlight,
    getLastFlightNumber,
    getFlightOrigins,
    getFlightDestinations,
    getFlightsByQuery,
    getFlights,
    createFlight,
    updateFlight,
    deleteFlight
} = require('../controllers/flightController');

router.get('/flight-search', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    res.render('flightSearch', {
        page: '/flight-search',
        script: '/scripts/user/flight-search.js',
        role: req.session.user.role,
    });
});

router.get('/flights', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'admin') {
        return res.redirect('/home');
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
            flightsCard: {
                flightRows: flights,
                pagination: pagination
            }
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.post('/flights', async (req, res) => {
    try {
        const lastFlightNumber = await getLastFlightNumber();
        const newFlightNumber = lastFlightNumber ? lastFlightNumber.flightNumber + 1 : 1;
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
        res.status(200).json({ success: true, flightNumber: newFlightNumber, airline: flightData.airline });
    } catch {
        res.status(500).json({ success: false });
    }
});

// APIs
router.get('/api/search', async (req, res) => {
    try {
        const flights = await flights.getFlightsByQuery();
        res.result(200).json({ success: true, flights: flights });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/flights-table', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        let { flights, totalFlights } = await getFlights(page, limit);
        const totalPages = Math.max(Math.ceil(totalFlights / limit));

        let pagination;

        if (page > totalPages) {
            page = totalPages;
            ({ flights, totalFlights } = await getFlights(page, limit));
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalFlights,
            resultsPerPage: limit,
            baseUrl: '/flights?page='
        };

        res.status(200).render('partials/flightsCard', {
            layout: false,
            flightsCard: {
                flightRows: flights,
                pagination: pagination
            }
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/flight-origins', async (req, res) => {
    try {
        const origins = await getFlightOrigins();
        res.status(200).json({ success: true, origins: origins });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/flight-destinations', async (req, res) => {
    try {
        const destinations = await getFlightDestinations();
        res.status(200).json({ success: true, destinations: destinations });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/:flightID', async (req, res) => {
    try {
        const flight = await getFlight(req.params.flightID);
        res.status(200).json({ success: true, flightData: flight });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/:flightID', async (req, res) => {
    try {
        const flightData = {
            _id: req.params.flightID,
            originAirport: {
                iata: req.body['edit-o-iata'],
                location: req.body['edit-o-location'],
                name: req.body['edit-o-name']
            },

            destinationAirport: {
                iata: req.body['edit-d-iata'],
                location: req.body['edit-d-location'],
                name: req.body['edit-d-name']
            },

            departureDatetime: new Date(req.body['edit-d-datetime']),
            arrivalDatetime: new Date(req.body['edit-a-datetime']),
            baseFare: Number(req.body['edit-fare']),
            flightStatus: req.body['edit-status']
        };

        const updatedFlight = await updateFlight(flightData);
        res.status(200).json({ success: true, airline: updatedFlight.airline, flightNumber: updatedFlight.flightNumber });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.delete('/api/:flightID', async (req, res) => {
    try {
        const deletedFlight = await deleteFlight(req.params.flightID);
        res.status(200).json({ success: true, airline: deletedFlight.airline, flightNumber: deletedFlight.flightNumber });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;