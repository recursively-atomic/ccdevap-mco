const controller = require('../controllers/reservationController');
const reservationModel = require('../models/reservationModel');
const flightModel = require('../models/flightModel');

jest.mock('../models/reservationModel');
jest.mock('../models/flightModel');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Reservation Management', () => {
    test('Successful Reservation Creation', async () => {
        const mockReservationData = {
            identifier: '0012WV',
            flightNumber: 2,
            userNumber: 2,
            email: 'random.kid@email.com',
            firstName: 'Random',
            lastName: 'Kid',
            suffix: '',
            passportCode: 'Z54321Y12345',
            seatNumber: 'B4',
            totalAmount: 4200
        };

        const mockSave = jest.fn().mockResolvedValue({ ...mockReservationData, status: 'Pending' });
        reservationModel.mockImplementation(() => ({ save: mockSave }));
        flightModel.findOneAndUpdate.mockResolvedValue({ flightNumber: 2, availableSeats: 15 });

        const result = await controller.createReservation(mockReservationData);
        expect(flightModel.findOneAndUpdate).toHaveBeenCalledWith(
            { flightNumber: 2, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } }
        );

        expect(mockSave).toHaveBeenCalled();
        expect(result.status).toBe('Pending');
    });

    test('Successful Reservation Cancellation', async () => {
        reservationModel.findOne.mockResolvedValue({ identifier: 'W12345X54321', flightNumber: 3 });
        flightModel.findOneAndUpdate.mockResolvedValue({});
        reservationModel.findOneAndUpdate.mockResolvedValue({ identifier: 'W12345X54321', status: 'Cancelled' });

        await controller.updateStatus('W12345X54321', 'Cancelled');

        expect(reservationModel.findOne).toHaveBeenCalledWith({ identifier: 'W12345X54321' });
        expect(flightModel.findOneAndUpdate).toHaveBeenCalledWith(
            { flightNumber: 3 },
            { $inc: { availableSeats: 1 } }
        );
        expect(reservationModel.findOneAndUpdate).toHaveBeenCalledWith(
            { identifier: 'W12345X54321' },
            { status: 'Cancelled' }
        );
    });

    test('Failed Reservation Cancellation (Reservation Not Found)', async () => {
        reservationModel.findOne.mockResolvedValue(null);

        await expect(controller.updateStatus('INVALID-ID', 'Cancelled')).rejects.toThrow(TypeError);

        expect(flightModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(reservationModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
});
