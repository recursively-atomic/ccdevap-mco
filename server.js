const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { createReservation } = require('./private/controllers/reservations');
const server = express();

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a == b
    }
});

server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

// Exposes every file in the public folder
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

server.get('/flight-book', (req, res) => {
    res.render('booking', {
        page: '/flight-book',
        script: '/scripts/user/booking.js'
    });
});

server.post('/flight-book', (req, res) => {
    try {
        const reservation = createReservation();
        res.status(200).json({ success: true, reservation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create sample reservation.' });
    }
});

server.get('/reservations', (req, res) => {
    res.sendFile(path.join(__dirname, './views/user/reservations.html'));
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