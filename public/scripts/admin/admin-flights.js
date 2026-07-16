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
            // capacityStatus is already computed on server, but we can also compute here
            const capacity = flight.capacityStatus || (flight.availableSeats > 0 ? 'Available' : 'Full');

            tableBody.innerHTML += `
                <tr>
                    <td>${flight.flightNumber}</td>
                    <td>${flight.origin}</td>
                    <td>${flight.destination}</td>
                    <td>${departure}</td>
                    <td>${arrival}</td>
                    <td>${flight.flightStatus}</td>
                    <td>${capacity}</td>
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

// Delete functions
function openDeleteModal(id) { selectedFlightId = id; }
async function confirmDelete() { await deleteFlight(selectedFlightId); hideModalShowToast("delete-flight", "delete-toast"); }
async function deleteFlight(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadFlights();
    } catch (error) { console.error(error); }
}

// Add flight
async function addFlight() {
    const flight = {
        flightNumber: document.getElementById("flightNumber").value,
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        departureDateTime: document.getElementById("departureDateTime").value,
        arrivalDateTime: document.getElementById("arrivalDateTime").value,
        flightStatus: document.getElementById("flightStatus").value || 'On Time'
    };
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(flight)
        });
        await response.json();
        hideModalShowToast("add-flight", "add-toast");
        loadFlights();
    } catch (error) { console.error(error); }
}
window.addFlight = addFlight;

// Edit functions
async function openEditModal(id) {
    selectedFlightId = id;
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const flight = await response.json();
        document.getElementById("editFlightNumber").value = flight.flightNumber;
        document.getElementById("editOrigin").value = flight.origin;
        document.getElementById("editDestination").value = flight.destination;
        // Format datetime-local value: YYYY-MM-DDTHH:mm
        const dep = new Date(flight.departureDateTime);
        const arr = new Date(flight.arrivalDateTime);
        document.getElementById("editDepartureDateTime").value = dep.toISOString().slice(0,16);
        document.getElementById("editArrivalDateTime").value = arr.toISOString().slice(0,16);
        document.getElementById("editFlightStatus").value = flight.flightStatus || 'On Time';
    } catch (error) { console.error(error); }
}

async function saveFlightChanges() {
    const updatedFlight = {
        flightNumber: document.getElementById("editFlightNumber").value,
        origin: document.getElementById("editOrigin").value,
        destination: document.getElementById("editDestination").value,
        departureDateTime: document.getElementById("editDepartureDateTime").value,
        arrivalDateTime: document.getElementById("editArrivalDateTime").value,
        flightStatus: document.getElementById("editFlightStatus").value
    };
    try {
        const response = await fetch(`${API_URL}/${selectedFlightId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFlight)
        });
        await response.json();
        hideModalShowToast("edit-flight", "edit-toast");
        loadFlights();
    } catch (error) { console.error(error); }
}

// View functions
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
        document.getElementById("viewCapacity").textContent = flight.capacityStatus || (flight.availableSeats > 0 ? 'Available' : 'Full');
    } catch (error) { console.error(error); }
}

// ============================
// TOAST / MODAL UTILITY
// ============================
function hideModalShowToast(modalID, toastID) {
    const modal = document.getElementById(modalID);
    const toast = document.getElementById(toastID);
    if (!modal || !toast) return;

    document.activeElement.blur();

    const modalInstance =
        bootstrap.Modal.getInstance(modal) ||
        new bootstrap.Modal(modal);

    const toastInstance =
        bootstrap.Toast.getInstance(toast) ||
        new bootstrap.Toast(toast, {
            delay: 2000,
            autohide: true
        });

    modalInstance.hide();
    toastInstance.show();
}