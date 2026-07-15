let editingPassengerId = null;
let paymentExists = false;

$(function () {
    changeProfile();
    showAgeBadge();
    showSpecifyGender();
    formatCardNumber();
    showInputFields();
   
    loadPassengers();
    loadPayment();
    loadNotificationPreferences();
    loadTravelHistory();

    $("#save-password-btn").on("click", savePassword);
    $("#save-passenger-btn").on("click", savePassenger);
    $("#add-passenger-btn").on("click", addPassenger);
    $("#make-passenger-profile-btn").on("click", addPassenger);

    $("#save-payment-btn").on("click", savePayment);
    $("#save-preferences-btn").on("click", saveNotificationPreferences);
    $("#discard-changes-btn").on("click", discardNotificationPreferences);

    $(document).on("click", ".delete-passenger", deletePassengerRecord);
    $(document).on("click", ".edit-passenger", editPassenger);

    $(document).on("click", ".reservation-details", showReservationDetails);

    $(document).on("click", ".passenger-details", showPassengerDetails);
});

/**
 * Enables a user to change their profile picture.
 */
function changeProfile() {
    const $changeProfile = $('#change-profile');

    $changeProfile.off('change').on('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = function (secondEvent) {
                $('#profile-picture').attr('src', secondEvent.target.result);
            };

            fileReader.readAsDataURL(file);
        }
    });
}

async function savePassword() {

    const currentPassword = $("#current-password").val().trim();
    const newPassword = $("#new-password").val().trim();

    if (!currentPassword || !newPassword) {
        alert("Please fill in both password fields.");
        return;
    }

    try {
        const response = await fetch("/api/users/change-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            $("#current-password").val("");
            $("#new-password").val("");
            showToast("profile-toast");

        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong.");
    }
}

async function savePassenger() {

    const passenger = {
        countryCode: $("#countryCode").val().trim(),
        passportCode: $("#passportCode").val().trim(),
        passportExpiration: $("#passportExpiration").val(),

        firstName: $("#passengerFirstName").val().trim(),
        lastName: $("#passengerLastName").val().trim(),
        suffix: $("#suffix").val(),

        birthDate: $("#birthDate").val(),
        gender: $("#gender").val(),
        nationality: $("#nationality").val(),

        emailAddress: $("#passengerEmail").val().trim(),

        phoneNumber:
            $("#phoneCountryCode").val().trim() +
            $("#phoneNumber").val().trim()
    };

    try {
        const url = editingPassengerId
            ? `/api/passengers/${editingPassengerId}`
            : "/api/passengers";
        const method = editingPassengerId
            ? "PUT"
            : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(passenger)
        });

        if (response.ok) {
        await loadPassengers();

        bootstrap.Tab.getOrCreateInstance(document.getElementById("saved-passengers-tab"))
            .show();
        showToast("passenger-toast");
    }

        const result = await response.json();
        if (result.success) {
            showToast("passenger-toast");
             // Reset edit mode
            editingPassengerId = null;
            
            $("#save-passenger-btn").text("Save Passenger");
            
            // Clear all input fields
            $("#passenger-information-pane input").val("");

            // Reset all dropdowns
            $("#passenger-information-pane select").prop("selectedIndex", 0);
                loadPassengers();

        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to save passenger.");
    }
}

async function loadPassengers() {

    try {
        const response = await fetch("/api/passengers");
        const result = await response.json();

        if (!result.success)
            return;

        const container = $("#saved-passengers-list");
        container.empty();
        result.passengers.forEach(passenger => {
            container.append(createPassengerCard(passenger));
        });

    } catch (err) {
        console.log(err);
    }
}

function createPassengerCard(passenger) {
    return `<div class="card m-4 p-4 shadow">
        <h4>${passenger.lastName},${passenger.firstName}</h4>

        <p> Passport: ${passenger.countryCode} ${passenger.passportCode}</p>
        <p> ${passenger.emailAddress}</p>

        <button class="btn btn-secondary edit-passenger"data-id="${passenger._id}">
            Edit Passenger
        </button>

        <button class="btn btn-danger delete-passenger" data-id="${passenger._id}">
            Delete Passenger
        </button>
    </div>`;
}

async function editPassenger() {
    const passengerId = $(this).data("id");

    try {
        const response = await fetch(`/api/passengers/${passengerId}`);
        const result = await response.json();

        if (!result.success)
            return;

        const p = result.passenger;
        editingPassengerId = passengerId;

        // Passport
        $("#countryCode").val(p.countryCode);
        $("#passportCode").val(p.passportCode);
        $("#passportExpiration").val(
            p.passportExpiration ?
            p.passportExpiration.substring(0,10) : ""
        );

        // Personal
        $("#passengerFirstName").val(p.firstName);
        $("#passengerLastName").val(p.lastName);
        $("#suffix").val(p.suffix);

        $("#birthDate").val(
            p.birthDate ?
            p.birthDate.substring(0,10) : ""
        );

        $("#gender").val(p.gender);
        $("#nationality").val(p.nationality);

        // Contact
        $("#passengerEmail").val(p.emailAddress);
        $("#phoneNumber").val(p.phoneNumber);
        
        // Change button text
        $("#save-passenger-btn").text("Update Passenger");
        // Switch tabs
        $("#passenger-information-tab").tab("show");

    } catch(err){
        console.log(err);
    }
}

function addPassenger() {
    editingPassengerId = null;

    clearPassengerForm();
    const passengerTab =
        document.getElementById("passenger-information-tab");
    bootstrap.Tab.getOrCreateInstance(passengerTab).show();
}

async function deletePassengerRecord() {
    const passengerId = $(this).data("id");

    if (!confirm("Are you sure you want to delete this passenger?")) {
        return;
    }

    try {
        const response = await fetch(`/api/passengers/${passengerId}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
            showToast("passenger-toast");
            loadPassengers();

        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to delete passenger.");
    }
}

/**
 * Clear passenger input from fields when adding a new passenger or after saving a passenger.
 * 
 * @param {string} toastID the toast's ID.
 */
function clearPassengerForm() {
    $("#countryCode").val("");
    $("#passportCode").val("");
    $("#passportExpiration").val("");

    $("#firstName").val("");
    $("#lastName").val("");
    $("#suffix").val("");

    $("#date-input").val("");
    $("#gender-select").val("");
    $("#other-gender-input").val("");

    $("#nationality").val("");
    $("#email").val("");
    $("#phoneCountryCode").val("");
    $("#phoneNumber").val("");
}

/**
 * Displays a toast.
 * 
 * @param {string} toastID the toast's ID.
 */
function showToast(toastID) {
    const toast = document.getElementById(toastID);

    document.activeElement.blur();
    
    const toastInstance =
        bootstrap.Toast.getInstance(toast) ||
        new bootstrap.Toast(toast, {
            delay: 2000,
            autohide: true
        });

    toastInstance.show();
}

/**
 * Shows a badge on what age group the passenger is based on
 * the birthdate inputted.
 */
function showAgeBadge() {
    const $dateContainer = $('#date-container');
    const $dateInput = $('#date-input');
    const $ageBadgeContainer = $('#age-badge-container');
    const $ageBadge = $('#age-badge');

    $dateInput.off('change').on('change', function () {
        const inputValue = $dateInput.val();

        // If there is a date input, show the badge
        if (inputValue) {
            const currentDate = new Date();
            const birthDate = new Date(inputValue);
            const differenceInDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));
            let ageCategories, ageCategory, ageBadgeText;

            ageCategories = [
                { label: 'Infant', min: 0, max: 730 },
                { label: 'Child', min: 731, max: 6570 },
                { label: 'Adult', min: 6571, max: 21900 },
                { label: 'Senior', min: 21901, max: Infinity }
            ];

            ageCategory = ageCategories.find(category =>
                differenceInDays >= category.min && differenceInDays <= category.max);
            ageBadgeText = ageCategory ? ageCategory.label : '';

            // If the date input is before the current date, show the badge
            if (ageBadgeText) {
                $dateContainer.removeClass('col-lg-12 col-md-12 col-sm-12 col-12');
                $dateContainer.addClass('col-lg-11 col-md-10 col-sm-10 col-10');
                $dateInput.removeClass('is-invalid').addClass('is-valid');

                $ageBadgeContainer.removeClass('d-none').addClass('col-lg-1 col-md-2 col-sm-2 col-2');
                $ageBadge.text(ageBadgeText);
            } else {
                $dateContainer.removeClass('col-lg-11 col-md-10 col-sm-10 col-10');
                $dateContainer.addClass('col-lg-12 col-md-12 col-sm-12 col-12');
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                $ageBadgeContainer.removeClass('col-lg-1 col-md-2 col-sm-2 col-2').addClass('d-none');
            }
        } else {
            $dateContainer.removeClass('col-lg-11 col-md-10 col-sm-10 col-10');
            $dateContainer.addClass('col-lg-12 col-md-12 col-sm-12 col-12');
            $dateInput.removeClass('is-valid').removeClass('is-invalid');

            $ageBadgeContainer.removeClass('col-lg-1 col-md-2 col-sm-2 col-2').addClass('d-none');
        }
    });
}

/**
 * Shows an "please specify" text field when the user selects "not listed"
 * in the gender dropdown.
 */
function showSpecifyGender() {
    const $genderSelect = $('#gender-select');
    const $otherGenderContainer = $('#other-gender-container');
    const $otherGenderInput = $('#other-gender-input');

    $genderSelect.off('change').on('change', function () {
        if ($genderSelect.val() === 'Not Listed') {
            $otherGenderContainer.removeClass('d-none');
            $otherGenderInput.focus();
        } else {
            $otherGenderContainer.addClass('d-none');
            $otherGenderInput.val('');
        }
    });
}

async function loadPayment() {
    try {
        const response = await fetch("/api/payment");
        const result = await response.json();

        if (!result.success)
            return;

        if (!result.payment)
            return;

        paymentExists = true;

        const p = result.payment;

        $("#payment-method-select").val(p.method);
        showInputFields();
        $("#cardHolderFirstName").val(p.cardHolderFirstName);
        $("#cardHolderLastName").val(p.cardHolderLastName);

        $("#receiptEmail").val(p.receiptEmail);

        $("#billingCountry").val(p.billingCountry);
        $("#billingRegion").val(p.billingRegion);
        $("#zipCode").val(p.zipCode);

        $("#cardNumber").val(p.cardNumber);
        $("#expirationDate").val(p.expirationDate);
        $("#cvn").val(p.cvn);

        $("#billingAddress1").val(p.billingAddress1);
        $("#billingAddress2").val(p.billingAddress2);

        $("#accountName").val(p.accountName);
        $("#accountNumber").val(p.accountNumber);

        showInputFields();

    } catch(err) {
        console.log(err);
    }
}

async function savePayment() {
    const method = $("#payment-method-select").val();
    const payment = { method };

    if (method === "Cash") { /* Nothing else to save*/} 
    
    else if ( method === "Credit Card" || method === "Debit Card") {
        payment.cardHolderFirstName = $("#cardHolderFirstName").val();
        payment.cardHolderLastName = $("#cardHolderLastName").val();
        payment.receiptEmail = $("#receiptEmail").val();
        payment.billingCountry = $("#billingCountry").val();
        payment.billingRegion = $("#billingRegion").val();
        payment.zipCode = $("#zipCode").val();
        payment.cardNumber = $("#cardNumber").val();
        payment.expirationDate = $("#expirationDate").val();
        payment.cvn = $("#cvn").val();
        payment.billingAddress1 = $("#billingAddress1").val();
        payment.billingAddress2 = $("#billingAddress2").val();
    }
    
    else if (method === "Digital Wallet") {
    payment.accountName = $("#accountName").val();
    payment.accountNumber = $("#accountNumber").val();
    }  

    const url = "/api/payment";
    const method = paymentExists ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payment)
        });

        const result = await response.json();

        if(result.success){
            paymentExists = true;
            showToast("payment-toast");
        }

    } catch(err){
        console.log(err);
    }
}

async function saveNotificationPreferences() {
    try {
        const preferences = {

            flightEmail: $("#flight-email").is(":checked"),
            flightSMS: $("#flight-sms").is(":checked"),

            gateEmail: $("#gate-email").is(":checked"),
            gateSMS: $("#gate-sms").is(":checked"),

            checkInEmail: $("#checkin-email").is(":checked"),
            checkInSMS: $("#checkin-sms").is(":checked"),

            boardingEmail: $("#boarding-email").is(":checked"),
            boardingSMS: $("#boarding-sms").is(":checked"),

            dealsEmail: $("#deals-email").is(":checked"),
            dealsSMS: $("#deals-sms").is(":checked"),

            partnerEmail: $("#partner-email").is(":checked"),
            partnerSMS: $("#partner-sms").is(":checked"),

            subscribeAllEmail: $("#all-email").is(":checked"),
            subscribeAllSMS: $("#all-sms").is(":checked")
        };

        const response = await fetch("/notification-preferences", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(preferences)
        });

        if (!response.ok) {
            throw new Error("Failed to save notification preferences.");
        }
        showToast("preference-toast");
    }

    catch (err) {
        console.error(err);
        alert("Unable to save notification preferences.");
    }
}

async function loadNotificationPreferences() {
    try {
        const response = await fetch("/notification-preferences");
        if (!response.ok) {
            throw new Error("Failed to load notification preferences.");
        }

        const preferences = await response.json();

        $("#flight-email").prop("checked", preferences.flightEmail || false);
        $("#flight-sms").prop("checked", preferences.flightSMS || false);

        $("#gate-email").prop("checked", preferences.gateEmail || false);
        $("#gate-sms").prop("checked", preferences.gateSMS || false);

        $("#checkin-email").prop("checked", preferences.checkInEmail || false);
        $("#checkin-sms").prop("checked", preferences.checkInSMS || false);

        $("#boarding-email").prop("checked", preferences.boardingEmail || false);
        $("#boarding-sms").prop("checked", preferences.boardingSMS || false);

        $("#deals-email").prop("checked", preferences.dealsEmail || false);
        $("#deals-sms").prop("checked", preferences.dealsSMS || false);

        $("#partner-email").prop("checked", preferences.partnerEmail || false);
        $("#partner-sms").prop("checked", preferences.partnerSMS || false);

        $("#all-email").prop("checked", preferences.subscribeAllEmail || false);
        $("#all-sms").prop("checked", preferences.subscribeAllSMS || false);
    }

    catch (err) {
        console.error(err);
    }
}

async function discardNotificationPreferences() {
    const confirmDiscard = confirm(
        "Discard all unsaved notification preference changes?"
    );

    if (!confirmDiscard) {
        return;
    }

    try {
        await loadNotificationPreferences();
    }
    catch (err) {
        console.error(err);
        alert("Unable to reload notification preferences.");
    }
}

async function loadTravelHistory() {

    const response = await fetch("/travel-history");
    const reservations = await response.json();

    const container = $("#travel-history-list");

    container.empty();

    if (reservations.length === 0) {
        container.html(`
            <div class="text-center p-5">
                <h4>No travel history yet.</h4>
            </div>
        `);
        return;
    }

    reservations.forEach(r => {
        container.append(`
            <div class="card m-4 p-4 shadow">
                <h4>${r.flightNumber}</h4>

                <p> Reservation #: ${r.reservationNumber} </p>

                <p> Passenger: ${r.firstName} ${r.lastName} </p>

                <p> Status: ${r.status} </p>

                <button class="btn btn-primary reservation-details" data-id="${r._id}">
                    Reservation Details
                </button>

                <button class="btn btn-secondary passenger-details" data-id="${r._id}">
                    Passenger Details
                </button>
            </div>
        `);
    });
}

async function showReservationDetails() {

    const id = $(this).data("id");
    const response =
        await fetch(`/travel-history/${id}`);

    const reservation =
        await response.json();

    $("#reservation-details .modal-body").html(`
        <p><strong>Reservation Number:</strong>
        ${reservation.reservationNumber}</p>

        <p><strong>Flight Number:</strong>
        ${reservation.flightNumber}</p>

        <p><strong>Seat:</strong>
        ${reservation.seatNumber}</p>

        <p><strong>Total:</strong>
        ₱${reservation.totalAmount}</p>

        <p><strong>Status:</strong>
        ${reservation.status}</p>

    `);
    new bootstrap.Modal(
        document.getElementById("reservation-details")
    ).show();
}

async function showPassengerDetails() {

    const id = $(this).data("id");
    const response =
        await fetch(`/travel-history/${id}`);
        
    const reservation =
        await response.json();
    $("#passenger-details .modal-body").html(`

        <p><strong>Name:</strong>
        ${reservation.firstName}
        ${reservation.lastName}</p>

        <p><strong>Email:</strong>
        ${reservation.email}</p>

        <p><strong>Passport:</strong>
        ${reservation.passportCode}</p>

        <p><strong>Seat:</strong>
        ${reservation.seatNumber}</p>

    `);
    new bootstrap.Modal(
        document.getElementById("passenger-details")
    ).show();
}

/**
 * Formats the card number into XXXX XXXX XXXX XXXX.
 */
function formatCardNumber() {
    $('#card-number').off('input').on('input', function () {
        const input = this;
        const inputValue = input.value;

        // Gets the cursor's old position before text formatting
        const oldPosition = input.selectionStart;

        // Remove non-digits and cap it to 16 digits
        const digits = inputValue.replace(/\D/g, '').slice(0, 16);

        // Adds a space every 4 digits
        const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
        let difference, newPosition;

        // Sets the card number's input to the formatted input
        input.value = formatted;

        // Calculate the difference of the length of the old to the formatted input
        difference = input.value.length - inputValue.length;

        // Calculate the expected cursor position after the formatting has been done
        newPosition = oldPosition + difference;

        // The new position is within the bounds of the user's input
        newPosition = Math.max(0, Math.min(newPosition, input.value.length));

        // Sets the cursor's new position
        input.setSelectionRange(newPosition, newPosition);
    });
}

/**
 * Shows input fields corresponding to the payment method that
 * the user chose in the payment method dropdown.
 */
function showInputFields(clearFields = true) {

    const $paymentMethodSelect = $("#payment-method-select");
    const $cardInputFields = $("#card-input-fields");
    const $digitalInputFields = $("#digital-input-fields");

    function clearCardFields() {
        $("#cardHolderFirstName").val("");
        $("#cardHolderLastName").val("");

        $("#receiptEmail").val("");

        $("#billingCountry").val("");
        $("#billingRegion").val("");
        $("#zipCode").val("");

        $("#cardNumber").val("");
        $("#expirationDate").val("");
        $("#cvn").val("");

        $("#billingAddress1").val("");
        $("#billingAddress2").val("");
    }

    function clearDigitalWalletFields() {
        $("#accountName").val("");
        $("#accountNumber").val("");
    }

    $cardInputFields.addClass("d-none");
    $digitalInputFields.addClass("d-none");

    $paymentMethodSelect.off("change").on("change", function () {

        switch ($(this).val()) {

            case "Credit Card":
            case "Debit Card":
                $cardInputFields.removeClass("d-none");
                $digitalInputFields.addClass("d-none");

                // Clear wallet fields
                if (clearFields) {
                clearDigitalWalletFields();
                }
                break;

            case "Digital Wallet":
                $digitalInputFields.removeClass("d-none");
                $cardInputFields.addClass("d-none");

                // Clear card fields
                if (clearFields) {
                clearCardFields();
                }
                break;

            case "Cash":
            default:
                $cardInputFields.addClass("d-none");
                $digitalInputFields.addClass("d-none");

                // Clear everything
                if (clearFields) {
                clearCardFields();
                clearDigitalWalletFields();
                }
                break;
        }
    });
}