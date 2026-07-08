const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // flight-number - CA####, FA####, AF####, SA####
    // airline (Cebu Atlantic, Filipino Airlines, AirFAST, Sunray Air)
    // origin
    // destination
    // departure - date and time
    // origin - date and time
    // available-seats (16 per flight para 4 each cabin class)
    // ticket-price
});

module.exports = mongoose.model('flights', schema);