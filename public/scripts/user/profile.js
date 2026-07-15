$(function () {
    changeProfile();
    showAgeBadge();
    showSpecifyGender();
    formatCardNumber();
    showInputFields();

    $("#save-password-btn").on("click", savePassword);
    $("#update-profile-btn").on("click", openProfileModal);
    $("#save-profile-btn").on("click", saveProfileInformation);
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

/**
 * Enables a user to change their password.
 */
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
            showToast("password-toast");

        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong.");
    }
}

/**
 * Opens a modal for users to edit their profile information.
 */
function openProfileModal() {

    $("#edit-first-name").val($("#profile-name").data("firstname"));
    $("#edit-last-name").val($("#profile-name").data("lastname"));
    $("#edit-email").val($("#profile-email").text().trim());
    $("#edit-contact").val($("#profile-contact").text().trim());

    const modal = new bootstrap.Modal(
        document.getElementById("update-profile-modal")
    );

    modal.show();
}

/**
 * Saves the profile information that was edited from the modal.
 */
async function saveProfileInformation() {

    const data = {
        firstName: $("#edit-first-name").val().trim(),
        lastName: $("#edit-last-name").val().trim(),
        emailAddress: $("#edit-email").val().trim(),
        contactNumber: $("#edit-contact").val().trim()
    };

    const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.success) {
        alert(result.message || "Failed to update profile.");
        return;
    }

    // Update the displayed information immediately
    $("#profile-name").text(
        result.user.lastName + ", " + result.user.firstName
    );

    $("#profile-email").text(result.user.emailAddress);

    $("#profile-contact").text(result.user.contactNumber);

    bootstrap.Modal.getInstance(
        document.getElementById("update-profile-modal")
    ).hide();

    bootstrap.Toast.getOrCreateInstance(
        document.getElementById("profile-toast")
    ).show();
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