$(document).ready(function () {
    // Initiate Variables
    let baseFare = 3500;
    let tax = 400;
    //Progress bar
    function updateProgress(step) {
        let percent = step * 25;
        $("#bookingProgress")
            .css("width", percent + "%")
            .text("Step " + step + " of 4");
    }
    // Calculate Total Costs
    function calculateTotal() {
        // default to no extra charges
        let extras = 0;
        if ($(".selected").hasClass("premium")) {
            extras += 1000;
        }
        if ($("#priorityBoarding").is(":checked")) {
            extras += 500;
        }
        if ($("#travelInsurance").is(":checked")) {
            extras += 700;
        }
        if ($("#loungeAccess").is(":checked")) {
            extras += 800;
        }
        let total = baseFare + tax + extras;
        $("#extrasCost").text(extras);
        $("#grandTotal").text(total);
    }
    // Event Call
    $("#priorityBoarding").change(function () {
        calculateTotal();
    });
    $("#travelInsurance").change(function () {
        calculateTotal();
    });
    $("#loungeAccess").change(function () {
        calculateTotal();
    });
    calculateTotal();
    // Seat Selection
    $(".seat").click(function () {
        if ($(this).hasClass("occupied")) {
            return;
        }
        $(".seat").removeClass("selected");
        $(this).addClass("selected");
        $("#summarySeat").text(
            $(this).text()
        );
        showToast(
            "Seat " + $(this).text() + " selected"
        );
        let seatType = "Standard";
        let seatPrice = "₱0";
        if ($(this).hasClass("premium")) {
            seatType = "Premium";
            seatPrice = "₱1000";
        }
        $("#seatInfo").html(
            "<strong>Seat:</strong> " + $(this).text() +
            "<br><strong>Type:</strong> " + seatType +
            "<br><strong>Extra Cost:</strong> " + seatPrice
        );
        const seatModal =
            new bootstrap.Modal(
                document.getElementById("seatModal")
            );
        seatModal.show();
        updateProgress(3);
        calculateTotal();
    });
    // Meal Selection
    $("#mealSelect").change(function () {
        let selectedMeal = $(this).val();
        $("#summaryMeal").text(selectedMeal);
        updateProgress(2);
        showToast(
            "Meal updated to " + selectedMeal
        );
    });
    // Toast Helper Function
    function showToast(message) {
        $("#toastMessage").text(message);
        const toast =
            new bootstrap.Toast(
                document.getElementById("bookingToast")
            );
        toast.show();
    }
    // Confirm Button
    $("#confirmBooking").click(function () {
        let name = $("#fullName").val().trim();
        let email = $("#email").val().trim();
        let phone = $("#phone").val().trim();
        let valid = true;
        $("#nameError").text("");
        $("#emailError").text("");
        $("#phoneError").text("");
        if (name === "") {
            $("#nameError").text(
                "Full Name is required."
            );
            valid = false;
        }
        if (email === "") {
            $("#emailError").text(
                "Email Address is required."
            );
            valid = false;
        }
        if (phone === "") {
            $("#phoneError").text(
                "Contact Number is required."
            );
            valid = false;
        }
        if (!valid) {
            showToast(
                "Please complete all required fields."
            );
            return;
        }
        updateProgress(4);
        showToast(
            "Booking confirmed successfully!"
        );
    });
});