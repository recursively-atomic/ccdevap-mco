const request = require('supertest');
const express = require('express');
let mockServer;

const { readUser } = require('../controllers/userController');
const { createFlight, readLastFlightNumber, updateFlight, deleteFlight } = require('../controllers/flightController');
const { createAudit } = require('../controllers/auditController');

jest.mock('../controllers/userController', () => ({
    readUser: jest.fn()
}));

jest.mock('../controllers/flightController', () => ({
    createFlight: jest.fn(),
    readLastFlightNumber: jest.fn(),
    updateFlight: jest.fn(),
    deleteFlight: jest.fn()
}));

jest.mock('../controllers/auditController', () => ({
    createAudit: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();

    mockServer = express();
    mockServer.use(express.json());
    mockServer.use(express.urlencoded({ extended: true }));
    mockServer.use((req, res, next) => {
        req.session = { user: { number: 1, role: 'admin' } };
        next();
    });

    mockServer.use('/', require('../routes/flightRoutes'));
});

describe('Flight Management', () => {
    test('Successful Creation', async () => {
        readLastFlightNumber.mockResolvedValue({ flightNumber: 1000 });
        readUser.mockResolvedValue({ userNumber: 1 });
        createFlight.mockResolvedValue({
            flightNumber: 1001,
            airline: 'AirFast',
            originAirport: { iata: 'MNL' },
            destinationAirport: { iata: 'CEB' },
            departureDatetime: new Date(),
            arrivalDatetime: new Date(Date.now() + 3600000),
        });

        const response = await request(mockServer)
            .post('/flights')
            .send({
                'airline': 'AirFAST',
                'origin-iata': 'MNL',
                'origin-location': 'Manila',
                'origin-name': 'Ninoy Aquino International Airport',
                'destination-iata': 'CEB',
                'destination-location': 'Cebu',
                'destination-name': 'Mactan–Cebu International Airport',
                'departure-datetime': new Date().toISOString(),
                'arrival-datetime': new Date(Date.now() + 3600000).toISOString(),
                'base-fare': 2000
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Failed Creation (Missing Information)', async () => {
        const response = await request(mockServer)
            .post('/flights')
            .send({
                'airline': 'AirFAST',
                'origin-iata': 'MNL',
                'origin-location': null,
                'origin-name': 'Ninoy Aquino International Airport',
                'destination-iata': 'CEB',
                'destination-location': null,
                'destination-name': 'Mactan–Cebu International Airport',
                'departure-datetime': new Date().toISOString(),
                'arrival-datetime': new Date(Date.now() + 3600000).toISOString(),
                'base-fare': 2000
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('Successful Update', async () => {
        readUser.mockResolvedValue({ userNumber: 1 });
        updateFlight.mockResolvedValue({
            flightNumber: 1000,
            airline: 'Cebu Atlantic',
            originAirport: { iata: 'MNL' },
            destinationAirport: { iata: 'CEB' },
            departureDatetime: new Date(),
            arrivalDatetime: new Date(Date.now() + 3600000),
            status: 'In Air'
        });

        const response = await request(mockServer)
            .put('/flights')
            .send({
                'flight-number': 1000,
                'edit-o-iata': 'MNL',
                'edit-o-location': 'Manila',
                'edit-o-name': 'Ninoy Aquino International Airport',
                'edit-d-iata': 'CEB',
                'edit-d-location': 'Cebu',
                'edit-d-name': 'Mactan-Cebu International Airport',
                'edit-d-datetime': new Date().toISOString(),
                'edit-a-datetime': new Date(Date.now() + 3600000).toISOString(),
                'edit-fare': 3000,
                'edit-status': 'In Air'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Successful Deletion', async () => {
        readUser.mockResolvedValue({ userNumber: 1 });
        deleteFlight.mockResolvedValue({
            flightNumber: 1000,
            airline: 'Cebu Atlantic',
            originAirport: { iata: 'MNL' },
            destinationAirport: { iata: 'CEB' },
            departureDatetime: new Date(),
            arrivalDatetime: new Date(Date.now() + 3600000),
        });

        const response = await request(mockServer)
            .delete('/flights')
            .send({ 'flight-number': 1000 });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
});