const API_URL = "http://localhost:3000/api/flights";
let selectedFlightId = null;

$(function () {
    formatBaseFare();
});

function formatBaseFare() {
    $('#base-fare').off('input.format').on('input.format', function () {
        // Removes all non-digit characters
        let value = $(this).val().replace(/\D/g, '');

        // Formats the numbers with commas
        if (value) {
            value = BigInt(value).toLocaleString('en-US');
        }

        // Updates the input field
        $(this).val(value);
    });
}

// Delete functions
// function openDeleteModal(id) { selectedFlightId = id; }
// async function confirmDelete() { await deleteFlight(selectedFlightId); hideModalShowToast("delete-flight", "delete-toast"); }
// async function deleteFlight(id) {
//     try {
//         await fetch(`${API_URL}/${id}`, { method: "DELETE" });
//         loadFlights();
//     } catch (error) { console.error(error); }
// }

// Edit functions
// async function openEditModal(id) {
//     selectedFlightId = id;
//     try {
//         const response = await fetch(`${API_URL}/${id}`);
//         const flight = await response.json();
//         document.getElementById("editFlightNumber").value = flight.flightNumber;
//         document.getElementById("editOrigin").value = flight.origin;
//         document.getElementById("editDestination").value = flight.destination;
//         // Format datetime-local value: YYYY-MM-DDTHH:mm
//         const dep = new Date(flight.departureDateTime);
//         const arr = new Date(flight.arrivalDateTime);
//         document.getElementById("editDepartureDateTime").value = dep.toISOString().slice(0, 16);
//         document.getElementById("editArrivalDateTime").value = arr.toISOString().slice(0, 16);
//         document.getElementById("editFlightStatus").value = flight.flightStatus || 'On Time';
//     } catch (error) { console.error(error); }
// }

// async function saveFlightChanges() {
//     const updatedFlight = {
//         flightNumber: document.getElementById("editFlightNumber").value,
//         origin: document.getElementById("editOrigin").value,
//         destination: document.getElementById("editDestination").value,
//         departureDateTime: document.getElementById("editDepartureDateTime").value,
//         arrivalDateTime: document.getElementById("editArrivalDateTime").value,
//         flightStatus: document.getElementById("editFlightStatus").value
//     };
//     try {
//         const response = await fetch(`${API_URL}/${selectedFlightId}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(updatedFlight)
//         });
//         await response.json();
//         hideModalShowToast("edit-flight", "edit-toast");
//         loadFlights();
//     } catch (error) { console.error(error); }
// }

// View functions
// async function openViewModal(id) {
//     try {
//         const response = await fetch(`${API_URL}/${id}`);
//         const flight = await response.json();
//         document.getElementById("viewFlightNumber").textContent = flight.flightNumber;
//         document.getElementById("viewOrigin").textContent = flight.origin;
//         document.getElementById("viewDestination").textContent = flight.destination;
//         document.getElementById("viewDeparture").textContent = new Date(flight.departureDateTime).toLocaleString();
//         document.getElementById("viewArrival").textContent = new Date(flight.arrivalDateTime).toLocaleString();
//         document.getElementById("viewStatus").textContent = flight.flightStatus;
//         document.getElementById("viewCapacity").textContent = flight.capacityStatus || (flight.availableSeats > 0 ? 'Available' : 'Full');
//     } catch (error) { console.error(error); }
// }

/**
 * Hides a modal and shows a toast with an optional display text.
 * 
 * @param {string} modalID the modal's ID.
 * @param {string} toastID the toast's ID.
 * @param {string} text the toast's display text.
 */
function hideModalShowToast(modalID, toastID, text = '') {
    const modal = document.getElementById(modalID);
    const toast = document.getElementById(toastID);
    const toastBody = toast.querySelector('.toast-body');

    document.activeElement.blur();

    if (text) {
        toastBody.textContent = text;
    }

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

function refreshFlightTable() {
    const page = new URLSearchParams(window.location.search).get('page') || 1;

    $.ajax({
        url: `/api/flights-table?page=${page}`,
        type: 'GET',
        success: function (html) {
            $('body').html(html);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

async function addFlight(event) {
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    event.preventDefault();
    data['base-fare'] = data['base-fare'].replace(/\,/g, '');

    try {
        const response = await fetch('/flights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            hideModalShowToast('add-flight', 'add-toast', `Successfully saved flight CA ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                refreshFlightTable();
            }, 1000);
        }
    } catch (error) {
        console.error(error);
    }
}