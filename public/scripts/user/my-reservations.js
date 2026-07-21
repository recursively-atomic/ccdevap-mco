$(function () {
    changeDropdownDisplay();
    viewReservation();
    editReservation();
    cancelReservation();
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
function viewReservation() {
    const $viewModal = $('#view-reservation');

    $viewModal.on('show.bs.modal', function (event) {
        const $button = $(event.relatedTarget);
        const reservationNumber = $button.data('reservation-number');
        const passengerName = $button.data('passenger-name');
        const flightNumber = $button.data('flight-number');
        const seatNumber = $button.data('seat-number');
        const status = $button.data('status');
        const statusBackground = $button.data('status-bg');

        const $title = $viewModal.find('.modal-title');
        const $body = $viewModal.find('.modal-body');

        $title.text(`${reservationNumber} Details`);
        $body.html(`
            <div class="d-flex align-items-center m-0 text-secondary">
                <div class="container d-flex flex-row p-0">
                    <h2 class="mb-0 me-2 fw-bold"> ${reservationNumber} </h2>

                    <span class="badge fs-6 rounded-pill ${statusBackground} text-white p-2 m-0 d-flex align-items-center">
                        ${status}
                    </span>
                </div>                
            </div>

            <h4 class="d-flex align-items-center m-0 p-0 text-dark">
                <p class="m-0 p-0 ps-3"> ${flightNumber} </p>
                <i class="m-0 p-0 bi bi-dot"></i>
                <p class="m-0 p-0"> ${seatNumber} </p>
            </h4>

            <h4 class="m-0 p-0 ps-3 text-dark"> ${passengerName} </h4>
        `);
    });
}

/**
 * Edits a reservation's associated seat.
 */
function editReservation() {
    const $editModal = $('#edit-reservation');
    const $seatMap = $('#seat-map');
    const editData = {
        reservationNumber: null,
        newSeat: null
    };

    $editModal.on('show.bs.modal', function (event) {
        const $button = $(event.relatedTarget);
        const reservationNumber = $button.data('reservation-number');
        const flightNumber = $button.data('flight-number');
        const seatNumber = $button.data('seat-number');

        editData.reservationNumber = reservationNumber;
        editData.newSeat = seatNumber;

        $editModal.find('.modal-title').text('Edit ' + reservationNumber);
        $seatMap.html('...Loading Seat Map...');

        $.ajax({
            url: `/api/${flightNumber}/${seatNumber}`,
            method: 'GET',
            success: function (html) {
                $seatMap.html(html);
                attachSeatSelection($seatMap, editData);
            },
            error: function () {
                $seatMap.html('Error Loading Seat Map!');
            }
        });
    });

    $('#save-button').off('click').on('click', function () {
        $.ajax({
            url: `/api/${editData.reservationNumber}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ seatNumber: editData.newSeat }),
            success: function () {
                const $card = $(`.card[data-reservation-number="${editData.reservationNumber}"]`);

                if ($card.length) {
                    $card.find('[data-seat-number]').data('seat-number', editData.newSeat);
                }

                hideModalShowToast(
                    'edit-reservation',
                    'edit-toast',
                    `Successfully changed seat to ${editData.newSeat} for reservation ${editData.reservationNumber}!`
                );
            },
            error: function (xhr) {
                alert('Editing Error: ' + xhr.responseText + '!');
            }
        });
    });
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
            $(this).addClass('selected');

            editData.newSeat = $(this).text().trim();
        }
    });
}

/**
 * Cancels a reservation by changing the reservation's status
 *  to 'Cancelled'.
 */
function cancelReservation() {
    const $cancelModal = $('#cancel-reservation');
    const cancelData = {
        reservationNumber: null
    };

    $cancelModal.on('show.bs.modal', function (event) {
        const $button = $(event.relatedTarget);
        const reservationNumber = $button.data('reservation-number');
        cancelData.reservationNumber = reservationNumber;
    });

    $('#cancel-button').off('click').on('click', function () {
        $.ajax({
            url: `/api/${cancelData.reservationNumber}/cancel`,
            method: 'PUT',
            contentType: 'application/json',
            success: function () {
                const $card = $(`.card[data-reservation-number="${cancelData.reservationNumber}"]`);

                if ($card.length) {
                    const $badge = $card.find('.badge');

                    $badge.text('Cancelled')
                          .removeClass('text-bg-success text-bg-warning')
                          .addClass('text-bg-danger');

                    $card.find('.btn').prop('disabled', true);
                }

                hideModalShowToast('cancel-reservation', 'cancel-toast', `Cancelled Reservation ${cancelData.reservationNumber}!`);
            },
            error: function (xhr) {
                alert('Cancellation Error: ' + xhr.responseText + '!');
            }
        });
    });
}