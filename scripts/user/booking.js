const stepsDone = {
    passengerInformation: false,
    mealSelection: false,
    seatSelection: false,
    extraService: false
};

const requiredFields = [
    { selector: '#first-name', isFilled: false },
    { selector: '#last-name', isFilled: false },
    { selector: '#suffix-select', isFilled: false },
    { selector: '#email-address', isFilled: false },
    { selector: '#domain-address', isFilled: false },
    { selector: '#country-number', isFilled: false },
    { selector: '#contact-number', isFilled: false },
    { selector: '#passport-code', isFilled: false },
    { selector: '#nationality', isFilled: false },
    { selector: '#date-input', isFilled: false },
    { selector: '#gender-select', isFilled: false },
    { selector: '#other-gender-input', isFilled: false }
];

let seatFare = 3500;
let classFare = 0;
let taxAndFee = 400;
let extraFee = 0;
let bookingTotal = 0;
let step = 0;

$(function () {
    increaseProgress('mealSelection');
    increaseProgress('extraService');
    checkPassengerInformation();
    showAgeBadge();
    showSpecifyGender();
    updateMealSelection();
    updateSeatSelection();
    updateServiceSelection();
    updateBookingSummary();
});

/**
 * Increases the progress bar by one.
 * 
 * @param {string} stepName the name of the step in the stepsDone array.
 */
function increaseProgress(stepName) {
    let finishedPercent;

    if (!stepsDone[stepName]) {
        stepsDone[stepName] = true;
        step++;

        finishedPercent = step * 25;
        $(".progress-bar").removeClass('w-25 w-50 w-75 w-100').addClass("w-" + finishedPercent).text("(" + step + "/4)");
    }
}

/**
 * Decreases the progress bar by one.
 * 
 * @param {string} stepName the name of the step in the stepsDone array.
 */
function decreaseProgress(stepName) {
    let finishedPercent;

    if (stepsDone[stepName]) {
        stepsDone[stepName] = false;
        step--;

        finishedPercent = step * 25;
        $(".progress-bar").removeClass('w-25 w-50 w-75 w-100').addClass("w-" + finishedPercent).text("(" + step + "/4)");
    }
}

/**
 * Keeps track if the required fields in the passenger information
 * card are filled with proper information.
 */
function checkPassengerInformation() {
    let isFilled = true;

    // Calls it self if any input within the fields is detected
    requiredFields.forEach(function (field) {
        $(field.selector).on('input', function () {
            checkPassengerInformation();
        });
    });

    // Checks if a field has the proper data, and flags
    // accordingly through the requireFields array.
    requiredFields.forEach(function (field) {
        const value = $(field.selector).val().trim();

        switch (field.selector) {
            case '#date-input':
                if (value !== '') {
                    const currentDate = new Date();
                    const birthDate = new Date(value);
                    const differenceInDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));

                    let ageCategories, ageCategory;

                    ageCategories = [
                        { label: 'Infant', min: 0, max: 730 },
                        { label: 'Child', min: 731, max: 6570 },
                        { label: 'Adult', min: 6571, max: 21900 },
                        { label: 'Senior', min: 21901, max: Infinity }
                    ];

                    ageCategory = ageCategories.find(category =>
                        differenceInDays >= category.min && differenceInDays <= category.max);

                    if (ageCategory) {
                        field.isFilled = true;
                    } else {
                        field.isFilled = false;
                    }
                } else {
                    field.isFilled = false;
                }
                break;
            case '#gender-select':
                if (value !== '') {
                    if (value === 'Not Listed') {
                        if ($('#other-gender-input').val().trim() !== '') {
                            field.isFilled = true;
                        } else {
                            field.isFilled = false;
                        }
                    } else {
                        field.isFilled = true;
                        requiredFields.find(field => field.selector == '#other-gender-input').isFilled = true;
                    }
                } else {
                    field.isFilled = false;
                }
                break;
            case '#other-gender-input':
                if (requiredFields.find(field => field.selector == '#gender-select').isFilled == true) {
                    field.isFilled = true;
                } else {
                    field.isFilled = false;
                }
                break;
            default:
                if (value !== '') {
                    field.isFilled = true;
                } else {
                    field.isFilled = false;
                }
                break;
        }
    });

    // Increases or decreases the user's progress accordingly.
    if (requiredFields.map(field => field.isFilled).every(Boolean)) {
        increaseProgress('passengerInformation');
    } else {
        decreaseProgress('passengerInformation');
    }
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
    const $invalidInput = $('#invalid-input');
    const $noInput = $('#no-input');

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

            // If the date input is before the current date, show the badge
            if (ageBadgeText) {
                $dateContainer.removeClass('col-lg-6');
                $dateContainer.addClass('col-lg-6');
                $dateInput.removeClass('is-invalid').addClass('is-valid');

                $ageBadgeContainer.removeClass('d-none');
                $ageBadge.text(ageBadgeText);
            } else {
                $dateContainer.removeClass('col-lg-6');
                $dateContainer.addClass('col-lg-6');
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                $invalidInput.removeClass('d-none');
                $noInput.addClass('d-none');

                $ageBadgeContainer.addClass('d-none');
            }
        } else {
            $dateContainer.removeClass('col-lg-6');
            $dateContainer.addClass('col-lg-6');
            $dateInput.removeClass('is-valid').removeClass('is-invalid');

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
 * Displays a toast whenever the user picks a
 * different meal package and displays the chosen
 * meal package in the booking summary.
 */
function updateMealSelection() {
    const $mealToast = $('#meal-toast');
    const $toastBody = $mealToast.find('.toast-body');
    const $selectedMeal = $('#selected-meal');
    const baseToast = new bootstrap.Toast($mealToast, {
        autohide: true,
        delay: 2000
    });

    $selectedMeal.text('Standard');
    $('#standard').prop('checked', true);

    $('input[name="meal-selection"]').change(function () {
        $toastBody.text(`Changed meal type to ${$(this).next('label').text().trim().toLowerCase()} meal!`);
        baseToast.show();

        $selectedMeal.text($(this).next('label').text().trim());
    });
}

/**
 * Displays a toast whenever the user picks a
 * seat and displays the chosen seat and its class
 * in the booking summary.
 */
function updateSeatSelection() {
    const $seatToast = $("#seat-toast");
    const $toastBody = $seatToast.find(".toast-body");
    const $selectedSeat = $('#selected-seat');
    const $selectedClass = $('#selected-class');
    const baseToast = new bootstrap.Toast($seatToast, {
        autohide: true,
        delay: 2000
    });

    let seatClass;

    $selectedSeat.text('None');
    $selectedClass.text('None');

    $(".seat").click(function () {
        increaseProgress('seatSelection');

        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");

            $toastBody.text(`Changed seat number to ${$(this).text().trim()}!`);
            baseToast.show();

            classFare = 0;

            if ($(this).hasClass('economy')) {
                seatClass = 'Economy';
            } else if ($(this).hasClass('premium')) {
                seatClass = 'Premium';
                classFare += 1000;
            } else {
                seatClass = 'First';
                classFare += 2000;
            }

            $selectedSeat.text(`${$(this).text().trim()}`);
            $selectedClass.text(`${seatClass} Class`);
            updateBookingSummary();
        }
    });
}

/**
 * Displays the extra services that the user will avail
 * in this booking.
 */
function updateServiceSelection() {
    const $hasExtraServices = $('#has-extra-services');
    const $noExtraServices = $('#no-extra-services');
    const serviceOrder = [
        { id: '#priority-boarding' },
        { id: '#travel-insurance' },
        { id: '#lounge-access' }
    ];

    let selectedServices = [];
    let serviceCount;

    $hasExtraServices.html('');
    $noExtraServices.text('None');
    $('#none').prop('checked', true);

    $('input[name="extra-services"], #additional-baggage').change(function () {
        switch ($(this).attr('id')) {
            case 'none':
                $('input[name="extra-services"]').not('#none').prop('checked', false);
                selectedServices.length = 0;
                break;
            case 'priority-boarding':
            case 'travel-insurance':
            case 'lounge-access':
                $('#none').prop('checked', false);

                selectedServices = serviceOrder
                    .filter(service => $(`${service.id}`).is(':checked'))
                    .map(service => $(`${service.id}`).next().text().trim());
                break;
        }

        serviceCount = selectedServices.length > 0;
        $hasExtraServices.html(serviceCount ? selectedServices.map(service => `<p class="m-0 p-0 ps-5"> ${service} </p>`) : '');
        $noExtraServices.text(serviceCount ? '' : 'None');

        updateBookingSummary();
    });
}

/**
 * Dynamically displays the user's choices in the different
 * selections and its cost with the breakdown.
 */
function updateBookingSummary() {
    const $baseFare = $('#base-fare');
    const $taxAndFee = $('#tax-and-fee');
    const $extraFee = $('#extra-fee');
    const $bookingTotal = $('#booking-total');

    extraFee = 0;

    $('input[name="extra-services"]:checked').each(function () {
        const serviceID = $(this).attr('id');

        if (serviceID === 'priority-boarding') {
            extraFee += 500;
        } else if (serviceID === 'travel-insurance') {
            extraFee += 700;
        } else if (serviceID === 'lounge-access') {
            extraFee += 800;
        }
    });

    $baseFare.text(classFare > 0 ?
        `PHP ${seatFare.toLocaleString('en-US')} + PHP ${classFare.toLocaleString('en-US')}` : `PHP ${seatFare.toLocaleString('en-US')}`);

    $extraFee.text(extraFee > 0 ? 'PHP ' + extraFee.toLocaleString('en-US') : 'PHP 0');
    $taxAndFee.text(`PHP ${taxAndFee.toLocaleString('en-US')}`);
    $bookingTotal.text(`PHP ${(seatFare + classFare + taxAndFee + extraFee).toLocaleString('en-US')}`);
}

/**
 * Dynamically displays if an input field has not yet been filled in
 * or has the wrong input.
 */
function showMissingFields() {
    requiredFields.forEach(function (field) {
        $(field.selector).on('input', function () {
            showMissingFields();
        });
    });

    requiredFields.forEach(function (field) {
        const value = $(field.selector).val().trim();

        switch (field.selector) {
            case '#date-input':
                if (value !== '') {
                    const currentDate = new Date();
                    const birthDate = new Date(value);
                    const differenceInDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));

                    let ageCategories, ageCategory;

                    ageCategories = [
                        { label: 'Infant', min: 0, max: 730 },
                        { label: 'Child', min: 731, max: 6570 },
                        { label: 'Adult', min: 6571, max: 21900 },
                        { label: 'Senior', min: 21901, max: Infinity }
                    ];

                    ageCategory = ageCategories.find(category =>
                        differenceInDays >= category.min && differenceInDays <= category.max);

                    if (ageCategory) {
                        $(field.selector).addClass('is-valid').removeClass('is-invalid');
                    }
                } else {
                    $(field.selector).addClass('is-invalid').removeClass('is-valid');
                    $('#invalid-input').addClass('d-none');
                    $('#no-input').removeClass('d-none');
                }
                break;
            case '#gender-select':
                if (value !== '') {
                    if (value === 'Not Listed') {
                        if ($('#other-gender-input').val().trim() !== '') {
                            $(field.selector).addClass('is-valid').removeClass('is-invalid');
                        } else {
                            $(field.selector).addClass('is-invalid').removeClass('is-valid');
                            $('#specify').removeClass('d-none');
                            $('#select').addClass('d-none');
                        }
                    } else {
                        $(field.selector).addClass('is-valid').removeClass('is-invalid');
                    }
                } else {
                    $(field.selector).addClass('is-invalid').removeClass('is-valid');
                }
                break;
            default:
                if (value !== '') {
                    $(field.selector).addClass('is-valid').removeClass('is-invalid');
                } else {
                    $(field.selector).addClass('is-invalid').removeClass('is-valid');
                }
                break;
        }
    });
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
 * Checks if all of the required details for a booking
 * are filled in and displays a toast if the confirmation
 * is successful or not.
 */
function confirmBooking() {
    let isFinished = false;

    showMissingFields();

    if (Object.values(stepsDone).every(Boolean)) {
        showToast('complete');
    } else {
        showToast('incomplete');
    }
}