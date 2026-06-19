$(function () {
    changeProfile();
    showAgeBadge();
    showSpecifyGender();
    formatCardNumber();
    showInputFields();
});

/**
 * Enables a user to change their profile picture.
 */
function changeProfile() {
    const $changeProfile = $('#change-profile');

    $changeProfile.on('change', function (event) {
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
 * Hides a modal and shows a toast.
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

    $dateInput.on('change', function () {
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

            // If the date input is before or on the current date, show the badge
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
            $dateInput.removeClass('is-valid').addClass('is-invalid');

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

    $genderSelect.on('change', function () {
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
    $('#card-number').on('input', function (event) {
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
function showInputFields() {
    const $paymentMethodSelect = $('#payment-method-select');
    const $cardInputFields = $('#card-input-fields');
    const $digitalInputFields = $('#digital-input-fields');

    $cardInputFields.addClass('d-none');
    $digitalInputFields.addClass('d-none');

    $paymentMethodSelect.on('change', function () {
        switch ($paymentMethodSelect.val()) {
            case 'Credit Card':
            case 'Debit Card':
                $cardInputFields.removeClass('d-none');
                $digitalInputFields.addClass('d-none');
                break;
            case 'Digital Wallet':
                $cardInputFields.addClass('d-none');
                $digitalInputFields.removeClass('d-none');
                break;
            default:
                $cardInputFields.addClass('d-none');
                $digitalInputFields.addClass('d-none');
                break;
        }
    });
}