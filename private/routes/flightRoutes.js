const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

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

router.get('/flight-search', authenticate, authorize(['user']), (req, res) => {
    const { origin, destination } = req.query;
    req.session.user.selectedFlight = null;

    res.render('flightSearch', {
        page: '/flight-search',
        script: '/scripts/flight-search.js',
        role: req.session.user.role,
        origin: origin,
        destination: destination
    });
});

router.get('/flights', authenticate, authorize(['admin']), async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1, limit = 10;
        const { flights, totalFlights } = await getFlights(page, limit);
        const totalPages = Math.max(1, Math.ceil(totalFlights / limit));

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
            script: '/scripts/flights.js',
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
        const requiredFields = [
            'airline',
            'origin-iata', 'origin-location', 'origin-name',
            'destination-iata', 'destination-location', 'destination-name',
            'departure-datetime', 'arrival-datetime', 'base-fare'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = req.body[field];

            return value === undefined || value === null || String(value).trim() === '';
        });

        if (missingFields.length > 0) {
            return res.status(400).json({ success: false });
        }

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
            departureDatetime: req.body['departure-datetime'],
            arrivalDatetime: req.body['arrival-datetime'],
            baseFare: req.body['base-fare']
        };

        await createFlight(flightData);
        res.status(200).json({ success: true, flightNumber: newFlightNumber, airline: flightData.airline });
    } catch {
        res.status(500).json({ success: false });
    }
});

// APIs
router.get('/api/read-flight-number', (req, res) => {
    res.status(200).json({ success: true, flightNumber: req.session.user.selectedFlight });
});

router.get('/api/search-flight', async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1, limit = 8;

        const { flights, totalFlights } = await getFlightsByQuery(req.query, page, limit);
        const totalPages = Math.max(1, Math.ceil(totalFlights / limit));
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalFlights,
            resultsPerPage: limit,
            baseUrl: '/flight-search?page='
        };

        res.status(200).render('partials/searchResults', {
            layout: false,
            flightCards: flights,
            pagination: pagination
        }, (err, html) => {
            if (err) {
                return res.status(500).json({ success: false });
            }

            res.status(200).json({ success: true, html });
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/get-flights-table', async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1, limit = 10;
        let { flights, totalFlights } = await getFlights(page, limit);
        const totalPages = Math.max(1, Math.ceil(totalFlights / limit));

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

router.get('/api/get-flight-origins', async (req, res) => {
    try {
        const origins = await getFlightOrigins();
        res.status(200).json({ success: true, origins: origins });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/get-flight-destinations', async (req, res) => {
    try {
        const destinations = await getFlightDestinations();
        res.status(200).json({ success: true, destinations: destinations });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/read-flight/:flightNumber', async (req, res) => {
    try {
        const flight = await getFlight(parseInt(req.params.flightNumber));
        res.status(200).json({ success: true, flightData: flight });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-flight/:flightNumber', async (req, res) => {
    try {
        const requiredFields = [
            'edit-o-iata', 'edit-o-location', 'edit-o-name',
            'edit-d-iata', 'edit-d-location', 'edit-d-name',
            'edit-d-datetime', 'edit-a-datetime', 'edit-fare',
            'edit-status'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = req.body[field];

            return value === undefined || value === null || String(value).trim() === '';
        });

        if (missingFields.length > 0) {
            return res.status(400).json({ success: false });
        }

        const flightData = {
            flightNumber: parseInt(req.params.flightNumber),
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
            status: req.body['edit-status']
        };

        const updatedFlight = await updateFlight(flightData);
        res.status(200).json({ success: true, airline: updatedFlight.airline, flightNumber: updatedFlight.flightNumber });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.delete('/api/delete-flight/:flightNumber', async (req, res) => {
    try {
        const deletedFlight = await deleteFlight(parseInt(req.params.flightNumber));
        res.status(200).json({ success: true, airline: deletedFlight.airline, flightNumber: deletedFlight.flightNumber });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;