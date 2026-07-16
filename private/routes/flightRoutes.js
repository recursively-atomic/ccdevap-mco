const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flightController");

// Get  ALL flights
router.get("/", flightController.getFlights);

// Get ONE flight
router.get("/:id", flightController.getFlight);

// Create new flight
router.post("/", flightController.createFlight);

// Update a flight
router.put("/:id", flightController.updateFlight)

// Delete a flight
router.delete("/:id", flightController.deleteFlight);

module.exports = router;