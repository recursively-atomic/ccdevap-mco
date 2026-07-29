let selectedFlight;

$(function () {
    $('#base-fare, #edit-fare').on('input.format', formatBaseFare);
});

/**
 * Formats a flight's base format with commas.
 * 
 * @param {InputEvent} event is the event of inputting on a field.
 */
function formatBaseFare(event) {
    let value = $(event.target).val().replace(/\D/g, '');

    // Formats the numbers with commas
    if (value) {
        value = BigInt(value).toLocaleString('en-US');
    }

    // Updates the input field
    $(event.target).val(value);
}

/**
 * Formats a datetime coming from mongoose for user display.
 * 
 * @param {Date} mongooseDatetime is the datetime data coming from mongoose.
 */
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
 * Displays a flight's details in a modal.
 * 
 * @param {String} flightNumber is the flight number.
 */
async function showViewModal(flightNumber) {
    const $viewModal = $('#view-flight');
    const $title = $viewModal.find('.modal-title');

    const $statusBagde = $('#status-badge');
    const $capacityBadge = $('#capacity-badge');

    const dateOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    try {
        const response = await fetch(`/api/read-flight/${flightNumber}`);
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const flightData = result.flightData;
        let airline = flightData.airline;
        let originAirport = flightData.originAirport;
        let destinationAirport = flightData.destinationAirport;
        let capacity = flightData.availableSeats;
        let status = flightData.status;

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

/**
 * Displays a modal where a user can edit a flight's details.
 * 
 * @param {String} flightNumber is the flight number.
 */
async function showEditModal(flightNumber) {
    const $editModal = $('#edit-flight');
    const $title = $editModal.find('.modal-title');

    const $status = $('#edit-status');
    const statusOptions = ['Scheduled', 'In Air', 'Delayed', 'Rescheduled', 'Cancelled'];

    selectedFlight = flightNumber;

    try {
        const response = await fetch(`/api/read-flight/${flightNumber}`);
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
        $status.empty();

        for (const status of statusOptions) {
            if (flightData.status == status) {
                $status.append(`<option selected> ${status} </option>`);
            } else {
                $status.append(`<option> ${status} </option>`);
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

/**
 * Displays a confirmation modal whether to delete a reservation 
 * or not.
 * 
 * @param {String} flightNumber is the flight number.
 */
function showDeleteModal(flightNumber) {
    selectedFlight = flightNumber;
}

async function createFlight(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

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
            hideModalShowToast('add-flight', 'success-toast', `Successfully saved flight ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                updateFlightsTable();
            }, 1000);
        }
    } finally {
        form.reset();
    }
}

/**
 * Updates a flight's details.
 * 
 * @param {SubmitEvent} event is the event of submitting a form.
 */
async function updateFlight(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data['edit-fare'] = data['edit-fare'].replace(/\,/g, '');

    try {
        const response = await fetch(`/api/update-flight/${selectedFlight}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            let airline = result.airline;

            airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
            hideModalShowToast('edit-flight', 'success-toast', `Successfully saved changes on ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                updateFlightsTable();
            }, 1000);
        }
    } finally { }
}

/**
 * Deletes a flight.
 */
async function deleteFlight() {
    event.preventDefault();

    try {
        const response = await fetch(`/api/delete-flight/${selectedFlight}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            let airline = result.airline;

            airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
            hideModalShowToast('delete-flight', 'danger-toast', `Deleted ${airline} ${String(result.flightNumber).padStart(4, '0')}!`);

            setTimeout(() => {
                updateFlightsTable();
            }, 1000);
        }
    } finally { }
}

/**
 * Updates the flights table to match the changes they made.
 */
async function updateFlightsTable() {
    const page = new URLSearchParams(window.location.search).get('page') || 1;

    try {
        const response = await fetch(`/api/get-flights-table?page=${page}`, {
            method: 'GET'
        });

        const markup = await response.text();
        const $flightsCard = $('#flights-card');

        if ($flightsCard) {
            $flightsCard.html(markup);
        }
    } finally { }
}