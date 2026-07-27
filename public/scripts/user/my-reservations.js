$(function () {
    changeDropdownDisplay();
});

/**
 * Changes the sort and filter dropdown's display according
 * to the user's selection.
 */
function changeDropdownDisplay() {
    bindListItemValue('#sort-dropdown', '#sort-type');
    bindListItemValue('#filter-dropdown', '#filter-type');
}

/**
 * Searches the value that the dropdown's display should take
 * according to the `.dropdown-item` that the user selected.
 * 
 * @param {HTMLElement} dropdown is the dropdown containing the `.dropdown-item` that was clicked.
 * @param {HTMLElement} display is the dropdown's appending text display.
 */
function bindListItemValue(dropdown, display) {
    const $dropdown = $(dropdown);
    const $display = $(display);

    $dropdown.off('click', '.dropdown-item').on('click', '.dropdown-item', function (event) {
        const $dropdownItem = $(this);
        const $listItem = $(this).closest('li');
        const listItemValue = $listItem.attr('value');

        $display.text(listItemValue);
        $dropdown.find('.dropdown-item').removeClass('active');
        $dropdownItem.addClass('active');
    });
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

/**
 * Views the details of a reservations by editing a modal's
 * title and content.
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

        $saveButton.off('click').on('click', async function () {
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

        hideModalShowToast('edit-reservation', 'edit-toast', `Successfully changed seat to ${editData.seat} for reservation ${identifier}!`);
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

    $seats.off('click').on('click', function () {
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

    $('#cancel-button').off('click').on('click', async function () {
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