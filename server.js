const express = require('express');
const handlebars = req9ore
const path = require('path');
const { connectToMongo } = require('./private/connection');
const server = express();

// Exposes every file in the public folder
server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});

server.get('/flight-search', (req, res) => {
    res.sendFile(path.join(__dirname, './views/user/search.html'));
});

server.get('/flight-book', (req, res) => {
    res.sendFile(path.join(__dirname, './views/user/booking.html'));
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