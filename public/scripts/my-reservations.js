$(function () {
    changeDropdownDisplay(false, false);
});

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

async function showEditModal(identifier) {
    const $editModal = $('#edit-reservation');
    const $title = $editModal.find('.modal-title');
    const $seatMap = $('#seat-map');
    const $saveButton = $('#save-button');
    const editData = {
        seat: null
    };

    try {
        const response = await fetch(`/api/read-seat/${identifier}`);
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

async function updateReservationSeat(identifier, editData) {
    try {
        const response = await fetch(`/api/update-seat/${identifier}`, {
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
 * Attaches a modified seat map on the modal of editing a reservation,
 * enabling a user to change a reservation's associated seat.
 * 
 * @param {HTMLElement} $seatMap the modal body. 
 * @param {Object} editData the edit data.
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

async function showCancelModal(identifier) {
    const $cancelModal = $('#cancel-reservation');
    const $card = $(`.card[data-identifier="${identifier}"]`);
    const $badge = $card.find('.badge');

    $('#cancel-button').off('click.cancel').on('click.cancel', async function () {
        try {
            const response = await fetch(`/api/update-cancel/${identifier}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            })

            const result = await response.json();

            if (!result.success || !$card.length) {
                return
            }

            $badge.text('Cancelled').removeClass('text-bg-success text-bg-warning').addClass('text-bg-danger');
            $card.find('.btn').prop('disabled', true);

            hideModalShowToast('cancel-reservation', 'cancel-toast', `Cancelled reservation ${identifier}!`);
        } finally { }
    });
}