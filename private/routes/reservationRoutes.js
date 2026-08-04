const express = require('express');
const router = express.Router();

const { getFlight } = require('../controllers/flightController');
const {
    getSeatMap,
    getReservation,
    getReservations,
    createReservation,
    updateSeat,
    updateStatus
} = require('../controllers/reservationController');

router.get('/my-reservations', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    req.session.user.selectedFlight = null;

    try {
        let page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await getReservations(page, limit, parseInt(req.session.user.number));
        const totalPages = Math.max(1, Math.ceil(totalReservations / limit));

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/my-reservations?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalReservations,
            resultsPerPage: limit,
            baseUrl: '/my-reservations?page='
        };

        res.status(200).render('my-reservations', {
            page: '/my-reservations',
            script: '/scripts/my-reservations.js',
            role: req.session.user.role,
            reservationCards: reservations,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/reservations', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'admin') {
        return res.redirect('/home');
    }

    try {
        let page = parseInt(req.query.page) || 1, limit = 10;
        const { reservations, totalReservations } = await getReservations(page, limit);
        const totalPages = Math.max(1, Math.ceil(totalReservations / limit));

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/reservations?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalReservations,
            resultsPerPage: limit,
            baseUrl: '/reservations?page='
        };

        res.status(200).render('reservations', {
            page: '/reservations',
            script: '/scripts/reservations.js',
            role: req.session.user.role,
            reservationRows: reservations,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/flight-book', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    } else if (!req.session.user.selectedFlight) {
        return res.redirect('/flight-search');
    }

    try {
        const seatMap = await getSeatMap(parseInt(req.session.user.selectedFlight));
        const flight = await getFlight(parseInt(req.session.user.selectedFlight));

        res.status(200).render('flightBook', {
            page: '/flight-book',
            script: '/scripts/flight-book.js',
            role: req.session.user.role,
            flight: flight,
            seats: seatMap
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.post('/flight-book', async (req, res) => {
    try {
        const reservation = await createReservation(req.body);
        res.status(200).json({ success: true, redirect: '/my-reservations' });
    } catch {
        res.status(500).json({ success: false });
    }
});

// APIs
router.get('/api/select-flight/:flightNumber', async (req, res) => {
    req.session.user.selectedFlight = req.params.flightNumber;
    res.redirect('/flight-book');
});

router.get('/api/read-reservation/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const reservation = await getReservation(identifier);

        res.status(200).json({ success: true, reservation: reservation });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/api/read-reservation-seat/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const reservation = await getReservation(identifier);

        const seatMap = await getSeatMap(parseInt(reservation.flight.flightNumber));
        const modifiedSeatMap = seatMap.map(row =>
            row.map(seat => {
                if (seat.number == reservation.seatNumber) {
                    return { ...seat, occupied: false, selected: true };
                } else {
                    return { ...seat, selected: false };
                }
            })
        );

        res.status(200).render('partials/seats', {
            layout: false,
            seats: modifiedSeatMap
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-reservation-seat/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const { seatNumber } = req.body;

        await updateSeat(identifier, seatNumber);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-reservation-cancel/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        await updateStatus(identifier, 'Cancelled');
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;