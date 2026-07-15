$(function () {

    loadReservations();

    $(document).on("click", ".view-reservation", viewReservation);
    $(document).on("click", ".edit-reservation", editReservation);
    $("#save-reservation-btn").on("click", saveReservation);
    $(document).on("click", ".delete-reservation", showDeleteReservationModal);
    $("#confirm-delete-reservation").on("click", deleteReservationRecord);

});

async function loadReservations() {
    const response = await fetch("/api/reservations");
    const reservations = await response.json();
    let html = "";

    reservations.forEach(reservation => {
        html += `
        <tr>
            <td>${reservation.reservationNumber}</td>
            <td>${reservation.firstName} ${reservation.lastName}</td>
            <td>${reservation.flightNumber}</td>
            <td>${reservation.seatNumber}</td>
            <td>${reservation.status}</td>

            <td>

                <button
                    class="btn btn-success btn-sm view-reservation"
                    data-id="${reservation._id}">
                    View
                </button>

                <button
                    class="btn btn-warning btn-sm edit-reservation"
                    data-id="${reservation._id}">
                    Edit
                </button>

                <button
                    class="btn btn-danger btn-sm delete-reservation"
                    data-id="${reservation._id}"
                    data-number="${reservation.reservationNumber}">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });
    $("tbody.table-group-divider").html(html);
}

async function viewReservation() {
    const id = $(this).data("id");
    const response = await fetch(`/api/reservations/${id}`);
    const reservation = await response.json();
    $("#view-reservation .modal-title").text(
        `${reservation.reservationNumber} Details`
    );

    $("#view-reservation .modal-body").html(`
        <p><strong>Passenger:</strong>
        ${reservation.firstName} ${reservation.lastName}</p>
        <p><strong>Email:</strong>
        ${reservation.email}</p>
        <p><strong>Flight:</strong>
        ${reservation.flightNumber}</p>
        <p><strong>Seat:</strong>
        ${reservation.seatNumber}</p>
        <p><strong>Passport:</strong>
        ${reservation.passportCode}</p>
        <p><strong>Total:</strong>
        ₱${reservation.totalAmount}</p>
        <p><strong>Status:</strong>
        ${reservation.status}</p>
    `);

    new bootstrap.Modal(
        document.getElementById("view-reservation")
    ).show();
}

async function editReservation() {
    const id = $(this).data("id");
    const response = await fetch(`/api/reservations/${id}`);
    const reservation = await response.json();

    $("#edit-reservation-id").val(
        reservation._id
    );
    $("#reservation-status").val(
        reservation.status
    );
    new bootstrap.Modal(
        document.getElementById("edit-reservation")
    ).show();
}

async function saveReservation() {

    const id = $("#edit-reservation-id").val();

    const status = $("#reservation-status").val();

    const response = await fetch(
            `/api/reservations/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status
                })
            }
        );

    const result = await response.json();

    if(result.success){
        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "edit-reservation"
                )
            )
            .hide();
        new bootstrap.Toast(
            document.getElementById(
                "edit-toast"
            )
        ).show();

        loadReservations();
    }
}

async function showDeleteReservationModal() {
    const id = $(this).data("id");
    const reservationNumber =
        $(this).data("number");

    $("#delete-reservation-id").val(id);
    $("#delete-toast .toast-body").text(`Deleted ${reservationNumber}!`);

    new bootstrap.Modal(
        document.getElementById("delete-reservation")
    ).show();
}

async function deleteReservationRecord() {
    const id = $("#delete-reservation-id").val();
    const response = await fetch(
        `/api/reservations/${id}`,
        {
            method: "DELETE"
        }
    );

    const result = await response.json();
    if (result.success) {
        bootstrap.Modal
            .getInstance(
                document.getElementById("delete-reservation")
            )
            .hide();
        const toast = new bootstrap.Toast(
            document.getElementById("delete-toast")
        );

        toast.show();
        loadReservations();
    }
}

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