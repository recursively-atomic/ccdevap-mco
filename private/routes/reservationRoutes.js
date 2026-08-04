const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const { createAudit } = require('../controllers/auditController');
const { readUser } = require('../controllers/userController');
const { readFlight } = require('../controllers/flightController');
const {
    createReservation,
    readSeatMap,
    readReservation,
    readReservations,
    updateSeat,
    updateStatus
} = require('../controllers/reservationController');

router.get('/flight-book', authenticate, authorize(['user']), async (req, res) => {
    if (!req.session.user.selectedFlight) {
        return res.redirect('/flight-search');
    }

    try {
        const seatMap = await readSeatMap(req.session.user.selectedFlight);
        const flight = await readFlight(req.session.user.selectedFlight);

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

router.post('/flight-book', authenticate, authorize(['user']), async (req, res) => {
    try {
        await createReservation(req.body);
        const reservation = await readReservation(req.body['identifier']);
        const user = await readUser(reservation.userNumber);
        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role,
            flightAirline: reservation.flight.airline,
            flightNumber: reservation.flight.flightNumber,
            reservationIdentifier: reservation.identifier,
            reservationSeat: reservation.seatNumber,
            action: 'r-cre',
        };

        await createAudit(auditData);
        res.status(200).json({ success: true, redirect: '/my-reservations' });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/my-reservations', authenticate, authorize(['user']), async (req, res) => {
    req.session.user.selectedFlight = null;

    try {
        let page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await readReservations(page, limit, req.session.user.number);
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

router.get('/reservations', authenticate, authorize(['admin']), async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1, limit = 10;
        const { reservations, totalReservations } = await readReservations(page, limit);
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
            role: req.session.user.role,
            reservationRows: reservations,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

// APIs
router.get('/api/select-flight/:flightNumber', authenticate, authorize(['user']), async (req, res) => {
    req.session.user.selectedFlight = parseInt(req.params.flightNumber);
    res.redirect('/flight-book');
});

router.get('/api/read-reservation-seat/:identifier', authenticate, authorize(['user']), async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const reservation = await readReservation(identifier);

        const seatMap = await readSeatMap(reservation.flight.flightNumber);
        const modifiedSeatMap = seatMap.map(row =>
            row.map(seat => {
                if (seat.number === reservation.seatNumber) {
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

router.get('/api/read-reservation/:identifier', authenticate, authorize(['user']), async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const reservation = await readReservation(identifier);

        res.status(200).json({ success: true, reservation: reservation });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-reservation-seat/:identifier', authenticate, authorize(['user']), async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const { seatNumber } = req.body;

        const reservation = await readReservation(identifier);
        await updateSeat(identifier, seatNumber);
        const updatedReservation = await readReservation(identifier);
        const user = await readUser(reservation.userNumber);
        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role,
            flightAirline: updatedReservation.flight.airline,
            flightNumber: updatedReservation.flight.flightNumber,
            reservationIdentifier: updatedReservation.identifier,
            reservationSeat: reservation.seatNumber,
            newReservationSeat: updatedReservation.seatNumber,
            action: 'r-upd',
        };

        await createAudit(auditData);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-reservation-cancel/:identifier', authenticate, authorize(['user']), async (req, res) => {
    try {
        const identifier = req.params.identifier;
        await updateStatus(identifier, 'Cancelled');

        const reservation = await readReservation(identifier);
        const user = await readUser(reservation.userNumber);
        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role,
            flightAirline: reservation.flight.airline,
            flightNumber: reservation.flight.flightNumber,
            reservationIdentifier: reservation.identifier,
            reservationSeat: reservation.seatNumber,
            action: 'r-can',
        };

        await createAudit(auditData);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;