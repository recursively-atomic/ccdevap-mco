$(function () {
    showAgeBadge();
    showSpecifyGender();
});

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
                $dateContainer.removeClass('col-12').addClass('col-11');
                $dateInput.removeClass('is-invalid').addClass('is-valid');

                $ageBadgeContainer.removeClass('d-none').addClass('col-1');
                $ageBadge.text(ageBadgeText);
            } else {
                $dateContainer.removeClass('col-11').addClass('col-12');
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                $ageBadgeContainer.removeClass('col-1').addClass('d-none');
            }
        } else {
            $dateContainer.removeClass('col-11').addClass('col-12');
            $dateInput.removeClass('is-valid').removeClass('is-invalid');

            $ageBadgeContainer.removeClass('col-1').addClass('d-none');
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
 * Shows a toast whenever a user updates their notification
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
 * Shows a toast whenever a user saves a passenger's
 * information.
 */
function showPassengerToast() {
    const updatedToast = $('#passenger-toast').get(0);
    const baseToast =
        bootstrap.Toast.getInstance(updatedToast) ||
        new bootstrap.Toast(updatedToast, { delay: 2000, autohide: true });

    baseToast.show();
}