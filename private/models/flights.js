const mongoose = require('mongoose');

const flightschema = new mongoose.Schema({
    // flight-number - CA####, FA####, AF####, SA####
    flightNumber: {type: String, required: true},
    // airline (Cebu Atlantic, Filipino Airlines, AirFAST, Sunray Air)
    airline: {type: String, required: true},
    // origin
    origin: {type: String, required: true},
    // destination
    destination: {type: String, required: true},
    // departure - date and time
    departure: {type: Date, required: true},
    // arrival - date and time
    arrival: {type: Date, required: true},
    // available-seats (16 per flight para 4 each cabin class)
    availableSeats: 16,
    // ticket-price
    ticketPrice: {type: mongoose.Schema.Types.Decimal128, required : true},
});

flightschema.set('toJSON', {
  getters: true,
  transform: (doc, ret) => {
    if (ret.ticketPrice) ret.ticketPrice = ret.ticketPrice.toString(); // Keeps full precision as a string
    return ret;
  }
});

module.exports = mongoose.model('flights', schema);
