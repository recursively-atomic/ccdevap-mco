$(function () {
    changeDropdownDisplay(false, false);
});

/**
 * Displays a reservation's details in a modal.
 * 
 * @param {String} identifier is the reservation identifier.
 */
async function showViewModal(identifier) {
    const $viewModal = $('#view-reservation');
    const $title = $viewModal.find('.modal-title');
    const $identifier = $('#identifier');
    const $status = $('#status');
    const $flightNumber = $('#flight-number');
    const $seatNumber = $('#seat-number');
    const $passengerName = $('#passenger-name');

    try {
        const response = await fetch(`/api/read-reservation/${identifier}`);
        const result = await response.json();

        if (!result.success) {
            return
        }

        const reservation = result.reservation;
        const flight = reservation.flight;
        let airline = flight.airline;

        airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';

        $title.text(`${identifier} Details`);
        $identifier.text(reservation.identifier);
        $status.text(reservation.status);
        $flightNumber.text(`${airline} ${String(flight.flightNumber).padStart(4, '0')}`);
        $seatNumber.text(reservation.seatNumber);
        $passengerName.text(`${reservation.firstName} ${reservation.lastName} ${reservation.suffix ? reservation.suffix : ''}`);
    } finally { }
}

/**
 * Displays a modal where a user can edit their seat in a
 * reservation.
 * 
 * @param {String} identifier is the reservation identifier.
 */
async function showEditModal(identifier) {
    const $editModal = $('#edit-reservation');
    const $title = $editModal.find('.modal-title');
    const $seatMap = $('#seat-map');
    const $saveButton = $('#save-button');
    const editData = {
        seat: null
    };

    try {
        const response = await fetch(`/api/read-reservation-seat/${identifier}`);
        const markup = await response.text();

        if (response.status != 200) {
            return
        }

        $title.text(`Edit ${identifier}`);
        $seatMap.html(markup);
        editData.seat = $seatMap.find('.seat.selected').text().trim();
        attachSeatSelection($seatMap, editData);

        $saveButton.off('click.save').on('click.save', async function () {
            await updateReservationSeat(identifier, editData);
        });
    } finally { }
}

/**
 * Attaches a modified seat map on the modal during editing a reservation.
 * 
 * @param {HTMLElement} $seatMap is the modal body. 
 * @param {Object} editData is the edit data.
 */
function attachSeatSelection($seatMap, editData) {
    const $seats = $seatMap.find('.seat');

    $seats.off('click.select').on('click.select', function () {
        if (!$(this).hasClass('occupied')) {
            $seats.removeClass('selected').addClass('available');
            $(this).removeClass('available').addClass('selected');

            editData.seat = $(this).text().trim();
        }
    });
}

/**
 * Updates a reservation's selected seat by the user.
 * 
 * @param {String} identifier is the reservation identifier.
 * @param {Object} editData is the edit data.
 */
async function updateReservationSeat(identifier, editData) {
    try {
        const response = await fetch(`/api/update-reservation-seat/${identifier}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatNumber: editData.seat })
        });

        const result = await response.json();

        if (!result.success) {
            return;
        }

        hideModalShowToast('edit-reservation', 'success-toast', `Successfully changed seat to ${editData.seat} for reservation ${identifier}!`);
    } finally { }
}

/**
 * Displays a confirmation modal whether to cancel a reservation 
 * or not.
 * 
 * @param {String} identifier is the reservation identifier.
 */
async function showCancelModal(identifier) {
    const $cancelModal = $('#cancel-reservation');
    const $card = $(`.card[data-identifier="${identifier}"]`);
    const $badge = $card.find('.badge');

    $('#cancel-button').off('click.cancel').on('click.cancel', async function () {
        try {
            const response = await fetch(`/api/update-reservation-cancel/${identifier}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            })

            const result = await response.json();

            if (!result.success || !$card.length) {
                return
            }

            $badge.text('Cancelled').removeClass('text-bg-success text-bg-warning').addClass('text-bg-danger');
            $card.find('.btn').prop('disabled', true);

            hideModalShowToast('cancel-reservation', 'danger-toast', `Cancelled reservation ${identifier}!`);
        } finally { }
    });
}