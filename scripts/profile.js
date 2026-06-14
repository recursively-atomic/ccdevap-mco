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
 * Shows a toast whenever the user saves their profile
 * information.
 */
function showProfileToast() {
    const profileToast = $('#profile-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(profileToast) ||
        new bootstrap.Toast(profileToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user saves a passenger's
 * information.
 */
function showPassengerToast() {
    const passengerToast = $('#passenger-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(passengerToast) ||
        new bootstrap.Toast(passengerToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user saves their payment
 * information.
 */
function showPaymentToast() {
    const paymentToast = $('#payment-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(paymentToast) ||
        new bootstrap.Toast(paymentToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user updates their notification
 * preferences.
 */
function showPreferencesToast() {
    const preferenceToast = $('#preference-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(preferenceToast) ||
        new bootstrap.Toast(preferenceToast, { delay: 2000, autohide: true });

    baseToast.show();
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
            let ageCategories;
            let ageCategory;
            let ageBadgeText;

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
                $dateContainer.removeClass('col-xl-12').removeClass('col-md-12').removeClass('col-sm-12').removeClass('col-12');
                $dateContainer.addClass('col-xl-11').addClass('col-md-11').addClass('col-sm-11').addClass('col-11');

                $dateInput.removeClass('is-invalid').addClass('is-valid');

                $ageBadgeContainer.removeClass('d-none');
                $ageBadgeContainer.addClass('col-xl-1').addClass('col-md-1').addClass('col-sm-1').addClass('col-1');

                $ageBadge.text(ageBadgeText);
            } else {
                $dateContainer.removeClass('col-xl-11').removeClass('col-md-11').removeClass('col-sm-11').removeClass('col-11');
                $dateContainer.addClass('col-xl-12');
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                $ageBadgeContainer.removeClass('col-xl-1').removeClass('col-md-1').removeClass('col-sm-1').removeClass('col-1');
                $ageBadgeContainer.addClass('d-none');
            }
        } else {
            $dateContainer.removeClass('col-xl-11').removeClass('col-md-11').removeClass('col-sm-11').removeClass('col-11');
            $dateContainer.addClass('col-xl-12');
            $dateInput.removeClass('is-valid').removeClass('is-invalid');

            $ageBadgeContainer.removeClass('col-xl-1').removeClass('col-md-1').removeClass('col-sm-1').removeClass('col-1');
            $ageBadgeContainer.addClass('d-none');
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
        const input = event.target;
        const inputValue = input.value;
        const prevousPosition = input.selectionStart;
        const digits = inputValue.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
        let difference, nextPosition;
        
        input.value = formatted;
        difference = input.value.length - inputValue.length;
        nextPosition = prevousPosition + difference;

        if (nextPosition < 0) nextPosition = 0;
        if (nextPosition > input.value.length) nextPosition = input.value.length;

        input.setSelectionRange(nextPosition, nextPosition);
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