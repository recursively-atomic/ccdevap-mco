const request = require('supertest');
const express = require('express');
let mockServer;

const { readUser } = require('../controllers/userController');
const { createReservation, readReservation, updateSeat, updateStatus } = require('../controllers/reservationController');
const { createAudit } = require('../controllers/auditController');

jest.mock('../controllers/userController', () => ({
    readUser: jest.fn()
}));

jest.mock('../controllers/reservationController', () => ({
    createReservation: jest.fn(),
    readReservation: jest.fn(),
    updateSeat: jest.fn(),
    updateStatus: jest.fn()
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
        req.session = { user: { number: 1, role: 'user' } };
        next();
    });

    mockServer.use('/', require('../routes/reservationRoutes'));
});

describe('Reservation Management', () => {
    test('Successful Creation', async () => {
        createReservation.mockResolvedValue({ identifier: 'JEST-RSV' });
        readUser.mockResolvedValue({ userNumber: 1 });
        readReservation.mockResolvedValue({
            identifier: 'JEST-RSV',

            flight: {
                airline: 'Filipino Airlines',
                flightNumber: 1
            }
        });

        const response = await request(mockServer)
            .post('/flight-book')
            .send({
                'identifier': 'JEST-RSV',
                'flightNumber': 1,
                'userNumber': 1,
                'email': 'jest@test.com',
                'firstName': 'Jest',
                'lastName': 'User',
                'suffix': '',
                'passportCode': 'MockPassport',
                'seatNumber': 'MockSeat A2',
                'totalAmount': 16000
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Successful Cancellation', async () => {
        updateStatus.mockResolvedValue(true);
        readUser.mockResolvedValue({ userNumber: 1 });
        readReservation.mockResolvedValue({
            identifier: 'JEST-RSV',

            flight: {
                airline: 'Filipino Airlines',
                flightNumber: 1
            }
        });

        const response = await request(mockServer)
            .put('/api/update-reservation-cancel/JEST-RSV');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Successful Update', async () => {
        updateSeat.mockResolvedValue(true);
        readReservation.mockResolvedValue({
            identifier: 'JEST-RSV',

            flight: {
                airline: 'Filipino Airlines',
                flightNumber: 1
            }
        });

        const response = await request(mockServer)
            .put('/api/update-reservation-seat/JEST-RSV')
            .send({
                'seatNumber': 'A1'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Failed Cancellation (Reservation Not Found)', async () => {
        updateStatus.mockResolvedValue(false);
        readUser.mockResolvedValue({ userNumber: 1 });
        readReservation.mockResolvedValue(null);

        const response = await request(mockServer)
            .put('/api/update-reservation-cancel/INVALID');

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
    });
});