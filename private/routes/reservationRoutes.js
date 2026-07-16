const express = require('express');
const router = express.Router();

const { getSeatMap, updateSeat, updateStatus } = require('../controllers/reservationController');

router.put('/:reservationNumber', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const { seatNumber } = req.body;

        const updatedReservation = await updateSeat(reservationNumber, seatNumber);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.put('/:reservationNumber/cancel', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const updated = await updateStatus(reservationNumber, 'Cancelled');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.get('/:flightNumber/:selectedSeat', async (req, res) => {
    try {
        const flightNumber = req.params.flightNumber;
        const selectedSeat = req.params.selectedSeat;

        const seatMap = await getSeatMap(flightNumber);
        const modifiedSeatMap = seatMap.map(row =>
            row.map(seat => {
                if (seat.number == selectedSeat) {
                    return { ...seat, occupied: false, selected: true };
                } else {
                    return { ...seat, selected: false };
                }
            })
        );

        res.render('seatsModal', {
            layout: false,
            seats: modifiedSeatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;