const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // reservationNumber (BR####)
    // flightNumber - refereces the flights collection
    // (firstName + lastName) passenger-name - references the users collection
    // seatNumber
    // status (Paid, Pending, Cancelled, emerut)
});

module.exports = mongoose.model('reservations', schema);