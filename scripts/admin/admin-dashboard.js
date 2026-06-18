$(document).ready(function () {
    // View Button Logic
    $(".viewBooking").click(function () {
        let row = $(this).closest("tr");
        let bookingID =
            row.find("td:eq(0)").text();
        let passenger =
            row.find("td:eq(1)").text();
        let route =
            row.find("td:eq(2)").text();
        let status =
            row.find("td:eq(3)").text();
        $("#reservationInfo").html(
            "<strong> Booking ID: </strong> " + bookingID +
            "<br><strong> Passenger: </strong> " + passenger +
            "<br><strong> Route: </strong> " + route +
            "<br><strong> Status: </strong> " + status
        );
        const modal =
            new bootstrap.Modal(
                document.getElementById("reservationModal")
            );
        modal.show();
        showToast(
            "Reservation " +
            bookingID +
            " loaded"
        );
    });
});