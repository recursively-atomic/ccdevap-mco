const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // reservation-number (BR####)
    // flight-number - refereces the flights collection
    // (first-name + last-name) passenger-name - references the users collection
    // seat-number
    // status (Paid, Pending, Cancelled, emerut)
});

module.exports = mongoose.model('reservations', schema);