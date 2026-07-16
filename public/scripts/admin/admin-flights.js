const API_URL = "http://localhost:3000/api/flights";
let selectedFlightId = null;

// Load flights
async function loadFlights() {
    try {
        const response = await fetch(API_URL);
        const flights = await response.json();
        const tableBody = document.getElementById("flightTableBody");
        tableBody.innerHTML = "";

        flights.forEach(flight => {
            const departure = new Date(flight.departureDateTime).toLocaleString();
            const arrival = new Date(flight.arrivalDateTime).toLocaleString();
            const capacityStatus = flight.availableSeats > 0 ? 'Available' : 'Full';

            tableBody.innerHTML += `
                <tr>
                    <td>${flight.flightNumber}</td>
                    <td>${flight.origin}</td>
                    <td>${flight.destination}</td>
                    <td>${departure}</td>
                    <td>${arrival}</td>
                    <td>${flight.flightStatus}</td>
                    <td>${capacityStatus}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="openViewModal('${flight._id}')" data-bs-toggle="modal" data-bs-target="#view-flight">View</button>
                        <button class="btn btn-warning btn-sm" onclick="openEditModal('${flight._id}')" data-bs-toggle="modal" data-bs-target="#edit-flight">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${flight._id}')" data-bs-toggle="modal" data-bs-target="#delete-flight">Delete</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById("flightCount").textContent = flights.length;
    } catch (error) {
        console.error(error);
    }
}

window.onload = loadFlights;

// Delete
function openDeleteModal(id) {
    selectedFlightId = id;
}

async function confirmDelete() {
    await deleteFlight(selectedFlightId);
    hideModalShowToast("delete-flight", "delete-toast");
}

async function deleteFlight(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadFlights();
    } catch (error) {
        console.error(error);
    }
}

// Add flight
async function addFlight() {
    const flight = {
        flightNumber: document.getElementById("flightNumber").value,
        airline: document.getElementById("airline").value,
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        departureDateTime: document.getElementById("departureDateTime").value,
        arrivalDateTime: document.getElementById("arrivalDateTime").value,
        ticketPrice: parseFloat(document.getElementById("ticketPrice").value),
        availableSeats: 16,
        layovers: 0,
        flightStatus: document.getElementById("flightStatus").value || 'On Time'
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(flight)
        });
        const data = await response.json();
        console.log(data);
        hideModalShowToast("add-flight", "add-toast");
        loadFlights();
    } catch (error) {
        console.error(error);
    }
}
window.addFlight = addFlight;

// Edit
async function openEditModal(id) {
    selectedFlightId = id;
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const flight = await response.json();
        document.getElementById("editFlightNumber").value = flight.flightNumber;
        document.getElementById("editAirline").value = flight.airline || '';
        document.getElementById("editOrigin").value = flight.origin;
        document.getElementById("editDestination").value = flight.destination;
        document.getElementById("editDepartureDateTime").value = flight.departureDateTime ? new Date(flight.departureDateTime).toISOString().slice(0,16) : '';
        document.getElementById("editArrivalDateTime").value = flight.arrivalDateTime ? new Date(flight.arrivalDateTime).toISOString().slice(0,16) : '';
        document.getElementById("editTicketPrice").value = flight.ticketPrice || '';
        document.getElementById("editFlightStatus").value = flight.flightStatus || 'On Time';
    } catch (error) {
        console.error(error);
    }
}

async function saveFlightChanges() {
    const updatedFlight = {
        flightNumber: document.getElementById("editFlightNumber").value,
        airline: document.getElementById("editAirline").value,
        origin: document.getElementById("editOrigin").value,
        destination: document.getElementById("editDestination").value,
        departureDateTime: document.getElementById("editDepartureDateTime").value,
        arrivalDateTime: document.getElementById("editArrivalDateTime").value,
        ticketPrice: parseFloat(document.getElementById("editTicketPrice").value),
        flightStatus: document.getElementById("editFlightStatus").value
    };

    try {
        const response = await fetch(`${API_URL}/${selectedFlightId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFlight)
        });
        const data = await response.json();
        console.log(data);
        hideModalShowToast("edit-flight", "edit-toast");
        loadFlights();
    } catch (error) {
        console.error(error);
    }
}

// View
async function openViewModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const flight = await response.json();
        document.getElementById("viewFlightNumber").textContent = flight.flightNumber;
        document.getElementById("viewOrigin").textContent = flight.origin;
        document.getElementById("viewDestination").textContent = flight.destination;
        document.getElementById("viewDeparture").textContent = new Date(flight.departureDateTime).toLocaleString();
        document.getElementById("viewArrival").textContent = new Date(flight.arrivalDateTime).toLocaleString();
        document.getElementById("viewStatus").textContent = flight.flightStatus;
        document.getElementById("viewCapacity").textContent = flight.availableSeats > 0 ? 'Available' : 'Full';
    } catch (error) {
        console.error(error);
    }
}