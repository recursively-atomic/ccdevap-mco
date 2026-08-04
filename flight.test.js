require('dotenv').config();
const mongoose = require('mongoose');

beforeAll(async () => {
    await mongoose.connect(
        `${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`
    );
});

afterAll(async () => {
    await mongoose.connection.close();
});

const {
    createFlight,
    readFlight,
    updateFlight,
    deleteFlight
} = require("../controllers/flightController");

test("Create flight", async () => {
    const flight = await createFlight({
        flightNumber: 9999,
        airline: "AirFAST",

        originAirport: {
            iata: "MNL",
            location: "Manila",
            name: "Ninoy Aquino"
        },

        destinationAirport: {
            iata: "CEB",
            location: "Cebu",
            name: "Mactan"
        },

        departureDatetime: new Date(),
        arrivalDatetime: new Date(Date.now() + 3600000),

        baseFare: 1000
    });

    expect(flight.flightNumber).toBe(9999);
});

test("Update flight", async () => {
    const updated = await updateFlight({
        flightNumber: 9999,

        originAirport: {
            iata: "MNL",
            location: "Manila",
            name: "Ninoy Aquino"
        },

        destinationAirport: {
            iata: "CEB",
            location: "Cebu",
            name: "Mactan"
        },

        departureDatetime: new Date(),
        arrivalDatetime: new Date(Date.now() + 3600000),

        baseFare: 2000,
        status: "Delayed"
    });

    expect(updated.status).toBe("Delayed");
});

test("Delete flight", async () => {
    await deleteFlight(9999);

    const deleted = await readFlight(9999);

    expect(deleted).toBeNull();
});

