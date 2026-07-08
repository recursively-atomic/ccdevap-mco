const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // flightNumber - CA####, FA####, AF####, SA####
    // airline (Cebu Atlantic, Filipino Airlines, AirFAST, Sunray Air)
    // origin
    // destination
    // departure - date and time
    // origin - date and time
    // availableSeats (16 per flight para 4 each cabin class)
    // ticketPrice
});

module.exports = mongoose.model('flights', schema);