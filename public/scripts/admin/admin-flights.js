/**
 * Hides a modal and shows a toast.
 * 
 * @param {string} modalID the modal's ID.
 * @param {string} toastID the toast's ID.
 */


function hideModalShowToast(modalID, toastID) {
    const modal = document.getElementById(modalID);
    const toast = document.getElementById(toastID);

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

const API_URL = "http://localhost:3000/api/flights";


let selectedFlightId = null; // Variable for deleting flights
let selectedFlight = null; // Variable for editing flights

// Loads all currently available flights
async function loadFlights() {

    try {

        const response = await fetch(API_URL);
        const flights = await response.json();

        const tableBody = document.getElementById("flightTableBody");

        tableBody.innerHTML = "";

        flights.forEach(flight => {

            tableBody.innerHTML += `
                <tr>

                    <td>${flight.flightNumber}</td>

                    <td>${flight.origin}</td>

                    <td>${flight.destination}</td>

                    <td>${flight.departureDateTime}</td>

                    <td>${flight.arrivalDateTime}</td>

                    <td>${flight.flightStatus}</td>

                    <td>${flight.capacityStatus}</td>

                    <td>
                        <button
                            class="btn btn-success btn-sm"
                            onclick="openViewModal(${flight.id})"
                            data-bs-toggle="modal"
                            data-bs-target="#view-flight">

                            View

                        </button>

                        <button
                            class="btn btn-warning btn-sm"
                            onclick="openEditModal(${flight.id})"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-flight">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="openDeleteModal(${flight.id})"
                            data-bs-toggle="modal"
                            data-bs-target="#delete-flight">

                            Delete

                        </button>

                    </td>

                </tr>
            `;

        });

        document.getElementById("flightCount").textContent = flights.length;

    }
    catch(error) {

        console.error(error);

    }

}

window.onload = loadFlights;

// Opens Delete Modal upon execution
function openDeleteModal(id) {

    selectedFlightId = id;

}

// Opens Edit Modal upon execution
async function openEditModal(id) {

    selectedFlightId = id;

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const flight = await response.json();

        selectedFlight = flight;

        document.getElementById("editFlightNumber").value =
            flight.flightNumber;

        document.getElementById("editOrigin").value =
            flight.origin;

        document.getElementById("editDestination").value =
            flight.destination;

        document.getElementById("editDepartureDateTime").value =
            flight.departureDateTime;

        document.getElementById("editArrivalDateTime").value =
            flight.arrivalDateTime;

        document.getElementById("editFlightStatus").value =
            flight.flightStatus;

    }

    catch(error) {

        console.error(error);

    }

}

// Confirms Deletion of selected flight
async function confirmDelete() {

    await deleteFlight(selectedFlightId);

    hideModalShowToast("delete-flight", "delete-toast");

}

// Adds a flight
async function addFlight() {

    const flight = {

        flightNumber: document.getElementById("flightNumber").value,

        origin: document.getElementById("origin").value,

        destination: document.getElementById("destination").value,

        departureDateTime: document.getElementById("departureDateTime").value,

        arrivalDateTime: document.getElementById("arrivalDateTime").value,

        flightStatus: document.getElementById("flightStatus").value,

        capacityStatus: "Available"

    };

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(flight)

        });

        const data = await response.json();

        console.log(data);

        hideModalShowToast("add-flight", "add-toast");

        loadFlights();

    }
    catch(error) {

        console.error(error);

    }

}

window.addFlight = addFlight;

// Deletes a flight
async function deleteFlight(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        const data = await response.json();

        console.log(data);

        loadFlights();

    }

    catch(error) {

        console.error(error);

    }

}

// Save button for editing
async function saveFlightChanges() {

    const updatedFlight = {

        flightNumber: document.getElementById("editFlightNumber").value,

        origin: document.getElementById("editOrigin").value,

        destination: document.getElementById("editDestination").value,

        departureDateTime:
            document.getElementById("editDepartureDateTime").value,

        arrivalDateTime:
            document.getElementById("editArrivalDateTime").value,

        flightStatus:
            document.getElementById("editFlightStatus").value,

        capacityStatus: selectedFlight.capacityStatus

    };

    try {

        const response = await fetch(
            `${API_URL}/${selectedFlightId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(updatedFlight)

            }
        );

        const data = await response.json();

        console.log(data);

        hideModalShowToast("edit-flight", "edit-toast");

        loadFlights();

    }

    catch(error) {

        console.error(error);

    }

}

// View a flight's details
async function openViewModal(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const flight = await response.json();

        console.log(flight);


        document.getElementById("viewFlightNumber").textContent =
            flight.flightNumber;

        document.getElementById("viewOrigin").textContent =
            flight.origin;

        document.getElementById("viewDestination").textContent =
            flight.destination;

        document.getElementById("viewDeparture").textContent =
            flight.departureDateTime;

        document.getElementById("viewArrival").textContent =
            flight.arrivalDateTime;

        document.getElementById("viewStatus").textContent =
            flight.flightStatus;

        document.getElementById("viewCapacity").textContent =
            flight.capacityStatus;

    }

    catch(error) {

        console.error(error);

    }

}