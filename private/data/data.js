const users = require('../models/userModel');
const flights = require('../models/flightModel');
const reservations = require('../models/reservationModel');

async function insertData() {
    // USERS
    await users.insertMany([
        {
            emailAddress: "admin@admin.com",
            password: "secure",
            firstName: "System",
            lastName: "Admin",
            passportCode: "SYS-12345",
            role: "admin"
        },
        {
            emailAddress: "jaughn-doe@user.com",
            password: "not-secure",
            firstName: "Jaughn",
            lastName: "Doe",
            passportCode: "JDO-12345"
        },
        {
            emailAddress: "jayenh-doe@user.com",
            password: "not-secure",
            firstName: "Jayenh",
            lastName: "Doe",
            passportCode: "JDO-54321"
        }
    ]);

    // FLIGHTS
    await flights.insertMany([
        {
            flightNumber: "1",
            airline: "Cebu Atlantic",
            originAirport: "Cebu CEB",
            destinationAirport: "Vancouver YVR",
            departureDate: "",
            arrivalDate: "",
            departureTime: "",
            arrivalTime: "",
            availableSeats: 16,
            ticketPrice: 15000
        },
        {
            flightNumber: "2",
            airline: "Cebu Atlantic",
            originAirport: "Airport A",
            destinationAirport: "Airport C",
            departureDate: "",
            arrivalDate: "",
            departureTime: "",
            arrivalTime: "",
            availableSeats: 16,
            ticketPrice: 3500
        }
    ]);
}

// insert reservations (2)