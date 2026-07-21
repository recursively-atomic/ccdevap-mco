const express = require('express');
const router = express.Router();

const { getSeatMap, getReservations, createReservation, updateSeat, updateStatus } = require('../controllers/reservationController');

router.get('/my-reservations', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "user") {
        return res.redirect("/dashboard");
    }

    try {
        const page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await getReservations(page, limit, req.session.user._id);
        const totalPages = Math.ceil(totalReservations / limit);

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
            script: '/scripts/user/my-reservations.js',
            role: req.session.user.role,
            reservationCards: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.get('/reservations', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/home");
    }

    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { reservations, totalReservations } = await getReservations(page, limit);
        const totalPages = Math.ceil(totalReservations / limit);

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
            script: '/scripts/admin/reservations.js',
            role: req.session.user.role,
            reservationRows: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.get('/flight-book', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "user") {
        return res.redirect("/dashboard");
    }

    try {
        const seatMap = await getSeatMap("TESTFLIGHT");

        res.status(200).render('booking', {
            page: '/flight-book',
            script: '/scripts/user/flight-book.js',
            role: req.session.user.role,
            seats: seatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.post('/flight-book', async (req, res) => {
    try {
        const reservation = await createReservation(req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// APIs
router.get('/api/:flightNumber/:selectedSeat', async (req, res) => {
    try {
        const flightNumber = req.params.flightNumber;
        const selectedSeat = req.params.selectedSeat;

        const seatMap = await getSeatMap(flightNumber);
        const modifiedSeatMap = seatMap.map(row =>
            row.map(seat => {
                if (seat.number == selectedSeat) {
                    return { ...seat, occupied: false, selected: true };
                } else {
                    return { ...seat, selected: false };
                }
            })
        );

        res.render('seatsModal', {
            layout: false,
            seats: modifiedSeatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.put('/api/:reservationNumber', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const { seatNumber } = req.body;

        const updatedReservation = await updateSeat(reservationNumber, seatNumber);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.put('/api/:reservationNumber/cancel', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const updated = await updateStatus(reservationNumber, 'Cancelled');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;