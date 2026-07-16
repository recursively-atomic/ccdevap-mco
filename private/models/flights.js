const mongoose = require('mongoose');

const flightschema = new mongoose.Schema({
    // flight-number - CA####, FA####, AF####, SA####
    flightNumber: {type: String, required: true},
    // airline (Cebu Atlantic, Filipino Airlines, AirFAST, Sunray Air)
    airline: {type: String, required: true},
    // origin
    originAirport: {type: String, required: true},
    // destination
    destinationAirport: {type: String, required: true},
    // departure - date
    departureDate: {type: Date, required: true},
    // arrival - date 
    arrivalDate: {type: Date, required: true},
    // available-seats (16 per flight para 4 each cabin class)
    departureTime: {type: String, required: true},
    // arrival - time
    arrivalTime: {type: String, required: true},
    // available-seats (16 per flight para 4 each cabin class)
    availableSeats: 16,
    // layovers
    layovers: {type: Number, default: 0},
    // ticket-price
    ticketPrice: {type: Number, required : true},
});

flightschema.set('toJSON', {
  getters: true,
  transform: (doc, ret) => {
    if (ret.ticketPrice) ret.ticketPrice = ret.ticketPrice.toString(); // Keeps full precision as a string
    return ret;
  }
});

const Flights = mongoose.model('flights', flightschema);
module.exports = Flights;
