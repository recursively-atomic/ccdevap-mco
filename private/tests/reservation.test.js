const controller = require('../../private/controllers/reservationController');
const reservationModel = require('../../private/models/reservationModel'); // Fixed name
const flightModel = require('../../private/models/flightModel');           // Fixed name

// Mocking Mongoose models
jest.mock('../../private/models/reservationModel');
jest.mock('../../private/models/flightModel');

describe('Reservation Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    test('should create a reservation and safely decrement seats in flight data', async () => {
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

      // Fixed: changed to mockResolvedValue (capital R)
      const mockSave = jest.fn().mockResolvedValue({ ...mockReservationData, status: 'Pending' });
      reservationModel.mockImplementation(() => ({ save: mockSave }));
      flightModel.findOneAndUpdate.mockResolvedValue({ flightNumber: 2, availableSeats: 15 });

      const result = await controller.createReservation(mockReservationData);

      // Verifying decrement
      expect(flightModel.findOneAndUpdate).toHaveBeenCalledWith(
        { flightNumber: 2, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } }
      );

      // Verifying returned result with default status
      expect(mockSave).toHaveBeenCalled();
      expect(result.status).toBe('Pending');
    });
  });

  describe('cancelReservation', () => {
    test('should restore an available seat on flight and update to Cancelled status', async () => {
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

    test('should throw error and stop if reservation not found', async () => {
      reservationModel.findOne.mockResolvedValue(null);

      await expect(controller.updateStatus('INVALID=ID', 'Cancelled')).rejects.toThrow(TypeError);

      expect(flightModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(reservationModel.findOneAndUpdate).not.toHaveBeenCalled(); // Fixed typo
    });
  });
});
