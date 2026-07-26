let selectedFlightID;

$(function () {
    formatBaseFare();
});

function formatBaseFare() {
    $('#base-fare, #edit-fare').off('input.format').on('input.format', function () {
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

function formatDuration(departure, arrival) {
    const difference = Math.abs(new Date(arrival) - new Date(departure));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    let display = [];

    if (days != 0) {
        display.push(`${days} D`);
    }

    if (hours != 0) {
        display.push(`${hours} H`);
    }

    if (minutes != 0) {
        display.push(`${minutes} M`);
    }

    return display.join(' ');
}

async function showViewModal(flightID) {
    const $viewModal = $('#view-flight');
    const $title = $viewModal.find('.modal-title');

    const $statusBagde = $('#status-badge');
    const $capacityBadge = $('#capacity-badge');

    const dateOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    try {
        const response = await fetch(`/api/${flightID}`);
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const flightData = result.flightData;
        let airline = flightData.airline;
        let originAirport = flightData.originAirport;
        let destinationAirport = flightData.destinationAirport;
        let capacity = flightData.availableSeats;
        let status = flightData.flightStatus;

        airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
        $title.text(`${airline} ${String(flightData.flightNumber).padStart(4, '0')} Details`);

        $('#flight-number').text(`${airline} ${String(flightData.flightNumber).padStart(4, '0')}`);
        $('#flight-fare').text(`PHP ${(flightData.baseFare).toLocaleString('en-US')}`);

        $('#departure-iata').text(originAirport.iata);
        $('#departure-location').text(originAirport.location);
        $('#departure-name').text(originAirport.name);
        $('#departure-day').text(Intl.DateTimeFormat('en-US', dateOptions).format(new Date(flightData.departureDatetime)));
        $('#departure-time').text(Intl.DateTimeFormat('en-US', timeOptions).format(new Date(flightData.departureDatetime)));

        $('#arrival-iata').text(destinationAirport.iata);
        $('#arrival-location').text(destinationAirport.location);
        $('#arrival-name').text(destinationAirport.name);
        $('#arrival-day').text(Intl.DateTimeFormat('en-US', dateOptions).format(new Date(flightData.arrivalDatetime)));
        $('#arrival-time').text(Intl.DateTimeFormat('en-US', timeOptions).format(new Date(flightData.arrivalDatetime)));

        if (status == 'Cancelled') {
            $statusBagde.text(status);
            $statusBagde.addClass('text-bg-danger');
        } else if (status == 'Delayed' || status == 'Rescheduled') {
            $statusBagde.text('status');
            $statusBagde.addClass('text-bg-warning');
        } else if (status == 'Scheduled' || status == 'In Air') {
            $statusBagde.text(status);
            $statusBagde.addClass('text-bg-success');
        }

        if (capacity == 0) {
            $capacityBadge.text('Full Flight');
            $capacityBadge.addClass('text-bg-danger');
        } else if (capacity <= 5) {
            $capacityBadge.text('Limited Seats');
            $capacityBadge.addClass('text-bg-warning');
        } else if (capacity >= 6 && capacity <= 16) {
            $capacityBadge.text('Available Flight');
            $capacityBadge.addClass('text-bg-success');
        }

        $('#duration-badge').text(formatDuration(flightData.departureDatetime, flightData.arrivalDatetime));
    } finally { }
}

async function showEditModal(flightID) {
    const $editModal = $('#edit-flight');
    const $title = $editModal.find('.modal-title');

    const $flightStatus = $('#edit-status');
    const statusOptions = ['Scheduled', 'In Air', 'Delayed', 'Rescheduled', 'Cancelled'];

    selectedFlightID = flightID;

    try {
        const response = await fetch(`/api/${flightID}`);
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const flightData = result.flightData;
        let airline = flightData.airline;
        let originAirport = flightData.originAirport;
        let destinationAirport = flightData.destinationAirport;

        airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
        $title.text(`Edit ${airline} ${String(flightData.flightNumber).padStart(4, '0')} Details`);

        $('#edit-fare').val((flightData.baseFare).toLocaleString('en-US'));
        $flightStatus.empty();

        for (const status of statusOptions) {
            if (flightData.flightStatus == status) {
                $flightStatus.append(`<option selected> ${status} </option>`);
            } else {
                $flightStatus.append(`<option> ${status} </option>`);
            }
        }

        $('#edit-o-iata').val(originAirport.iata);
        $('#edit-o-location').val(originAirport.location);
        $('#edit-o-name').val(originAirport.name);

        $('#edit-d-iata').val(destinationAirport.iata);
        $('#edit-d-location').val(destinationAirport.location);
        $('#edit-d-name').val(destinationAirport.name);

        $('#edit-d-datetime').val(formatDatetime(flightData.departureDatetime));
        $('#edit-a-datetime').val(formatDatetime(flightData.arrivalDatetime));
    } finally { }
}

async function updateFlight(event) {
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    event.preventDefault();
    data['edit-fare'] = data['edit-fare'].replace(/\,/g, '');

    try {
        const response = await fetch(`/api/${selectedFlightID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            let airline = result.airline;

            airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
            hideModalShowToast('edit-flight', 'edit-toast', `Successfully saved changes on ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                refreshFlightTable();
            }, 1000);
        }
    } finally { }
}

function formatDatetime(mongooseDatetime) {
    const datetime = new Date(mongooseDatetime);
    const pad = (num) => String(num).padStart(2, '0');

    const year = datetime.getFullYear();
    const month = pad(datetime.getMonth() + 1);
    const day = pad(datetime.getDate());
    const hours = pad(datetime.getHours());
    const minutes = pad(datetime.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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
            $('#flights-card').html(html);
        }
    });
}

async function createFlight(event) {
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
            let airline = result.airline;
            airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
            hideModalShowToast('add-flight', 'add-toast', `Successfully saved flight ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                refreshFlightTable();
            }, 1000);
        }
    } finally {
        form.reset();
    }
}

function showDeleteModal(flightID) {
    selectedFlightID = flightID;
}

async function deleteFlight() {
    event.preventDefault();

    try {
        const response = await fetch(`/api/${selectedFlightID}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            let airline = result.airline;

            airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
            hideModalShowToast('delete-flight', 'delete-toast', `Deleted ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                refreshFlightTable();
            }, 1000);
        }
    } finally { }
}