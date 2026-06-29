$(function () {
    showReservationDetails();
    showDashboardToast();
});

/**
 * Shows the details of a booking reference.
 */
function showReservationDetails() {
    $(".view-reservation").off('click').on('click', function () {
        const $viewReservationModal = $("#view-reservation");
        const baseModal = new bootstrap.Modal($viewReservationModal);

        const tableRow = $(this).closest("tr");
        const bookingReference = tableRow.find("th:eq(0)").text();
        // Add more details that align with booking.html

        $("#view-reservation .modal-title").html(
            bookingReference + "Details"
        );

        baseModal.show();
    });
}

/**
 * Shows a welcome toast when a user enters the page.
 */
function showDashboardToast() {
    const $dashboardToast = $("#dashboard-toast");
    const baseToast = new bootstrap.Toast($dashboardToast, {
        autohide: true,
        delay: 2000
    });

    baseToast.show();
}