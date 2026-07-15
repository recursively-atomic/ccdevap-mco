const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { getSeatMap, getReservationCards, createReservation, updateSeat, updateStatus } = require('./private/controllers/reservations');
const server = express();

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a == b,
        gt: (a, b) => a > b,
        gte: (a, b) => a >= b,
        lt: (a, b) => a < b,
        lte: (a, b) => a <= b,
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        range: (start, end) => {
            const arr = [];
            for (let i = start; i <= end; i++) arr.push(i);
            return arr;
        },
        or: (a, b) => a || b,
        and: (a, b) => a && b,
        format: (n) => n.toLocaleString('en-US')
    }
});

server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.json());
server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.render('index', {
        page: '/',
        script: '/scripts/index.js'
    });
});

server.get('/flight-search', (req, res) => {
    res.sendFile(path.join(__dirname, './views/user/search.html'));
});

server.get('/flight-book', async (req, res) => {
    try {
        const seatMap = await getSeatMap("TESTFLIGHT");

        res.status(200).render('booking', {
            page: '/flight-book',
            script: '/scripts/user/booking.js',
            seats: seatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.post('/flight-book', async (req, res) => {
    try {
        const reservation = await createReservation(req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.put('/api/:reservationNumber', async (req, res) => {
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

server.put('/api/:reservationNumber/cancel', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const updated = await updateStatus(reservationNumber, 'Cancelled');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/api/:flightNumber/:selectedSeat', async (req, res) => {
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

server.get('/reservations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await getReservationCards("TESTUSER", page, limit);
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
            script: '/scripts/user/reservations.js',
            reservationCards: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});