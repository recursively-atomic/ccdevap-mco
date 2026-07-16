const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	flightNumber: {
		type: String,
		required: true
	},

	airline: {
		type: String,
		required: true
	},
	
	origin: {
		type: String,
		required: true
	},

	destination: {
		type: String,
		required: true
	},

	departureDate: {
		type: Date,
		required: true
	},

	arrivalDate: {
		type: Date,
		required: true
	},

	departureTime: {
		type: String,
		required: true
	},

	arrivalTime: {
		type: String,
		required: true
	},

	availableSeats: 16,

	layovers: {
		type: Number,
		default: 0,
	},

	ticketPrice: {
		type: Number,
		required: true
	},
});

schema.set('toJSON', {
	getters: true,
	transform: (doc, ret) => {
		if (ret.ticketPrice) ret.ticketPrice = ret.ticketPrice.toString(); // Keeps full precision as a string
		return ret;
	}
});

module.exports = mongoose.model('flights', schema);
