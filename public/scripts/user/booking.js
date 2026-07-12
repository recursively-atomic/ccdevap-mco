const stepsDone = {
    passengerInformation: false,
    mealSelection: false,
    seatSelection: false,
    extraService: false
};

let requiredFields;
let seatFare = 3500;
let classFare = 0;
let taxAndFee = 400;
let extraFee = 0;
let step = 0;

$(function () {
    getRequiredFields();
    increaseProgress('mealSelection');
    increaseProgress('extraService');
    bindPassengerInformationEvents();
    checkPassengerInformation();
    showAgeBadge();
    showSpecifyGender();
    updateMealSelection();
    updateSeatSelection();
    updateServiceSelection();
    updateBookingSummary();
});

/**
 * Gets all the required fields by first getting the elements with the
 * `.required-field` class and getting their ids.
 */
function getRequiredFields() {
    requiredFields = $('.required-field').map(function () {
        return {
            selector: '#' + $(this).attr('id'),
            isFilled: false
        };
    }).get();
}

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
 * Binds `checkPassengerInformation()` to all of the required fields for
 * a booking, whenever a field's input has changed.
 */
function bindPassengerInformationEvents() {
    requiredFields.forEach(function (field) {
        $(field.selector).off('input.check').on('input.check', function () {
            checkPassengerInformation();
        });
    });
}

/**
 * Keeps track if the required fields in the passenger information
 * card are filled with proper information.
 */
function checkPassengerInformation() {
    requiredFields.forEach(function (field) {
        const value = $(field.selector).val().trim();

        // Checks if a field has the proper data, and flags
        // accordingly through the requireFields array.
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
    const $dateInput = $('#date-input');
    const $ageBadgeContainer = $('#age-badge-container');
    const $ageBadge = $('#age-badge');
    const $invalidInput = $('#invalid-input');
    const $noInput = $('#no-input');

    $dateInput.off('change.ageBadge').on('change.ageBadge', function () {
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
                $dateInput.removeClass('is-invalid').addClass('is-valid');

                $ageBadgeContainer.removeClass('d-none');
                $ageBadge.text(ageBadgeText);
            } else {
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                $ageBadgeContainer.addClass('d-none');

                $invalidInput.removeClass('d-none');
                $noInput.addClass('d-none');
            }
        } else {
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

    $genderSelect.off('change.gender').on('change.gender', function () {
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
    const $selectedMeal = $('#selected-meal');

    $selectedMeal.text('Standard');
    $('#standard').prop('checked', true);

    $('input[name="meal-selection"]').off('change').on('change', function () {
        showToast('#meal-toast', `Changed meal type to ${$(this).next('label').text().trim().toLowerCase()} meal!`);
        $selectedMeal.text($(this).next('label').text().trim());
    });
}

/**
 * Displays a toast whenever the user picks a
 * seat and displays the chosen seat and its class
 * in the booking summary.
 */
function updateSeatSelection() {
    const $selectedSeat = $('#selected-seat');
    const $selectedClass = $('#selected-class');

    let seatClass;

    $selectedSeat.text('None');
    $selectedClass.text('None');

    $(".seat").off('click').on('click', function () {
        increaseProgress('seatSelection');

        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");

            showToast('#seat-toast', `Changed seat number to ${$(this).text().trim()}!`);
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

    $('input[name="extra-services"], #additional-baggage').off('change').on('change', function () {
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
 * Displays a toast with an optional display text.
 * 
 * @param {string} toastID the toast's ID.
 * @param {string} text the toast's display text.
 */
function showToast(toastID, text = '') {
    const toast = document.querySelector(toastID);
    const toastBody = toast.querySelector('.toast-body');

    document.activeElement.blur();

    if (text) {
        toastBody.textContent = text;
    }

    const toastInstance =
        bootstrap.Toast.getInstance(toast) ||
        new bootstrap.Toast(toast, {
            delay: 2000,
            autohide: true
        });

    toastInstance.show();
}

/**
 * Binds `showMissingFields()` to all of the required fields for
 * searching a flight, whenver a field's input has changed.
 */
function bindMissingFieldsEvents() {
    requiredFields.forEach(function (field) {
        $(field.selector).off('input.show change.show').on('input.show change.show', function () {
            showMissingFields();
        });
    });
}

/**
 * Displays to the user the emtpy fields that are required
 * to confirm a booking.
 */
function showMissingFields() {
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
                        $(field.selector).removeClass('is-invalid').addClass('is-valid');
                    }
                } else {
                    $(field.selector).removeClass('is-valid').addClass('is-invalid');
                    $('#invalid-input').addClass('d-none');
                    $('#no-input').removeClass('d-none');
                }
                break;
            case '#gender-select':
                if (value !== '') {
                    if (value === 'Not Listed') {
                        if ($('#other-gender-input').val().trim() !== '') {
                            $(field.selector).removeClass('is-invalid').addClass('is-valid');
                        } else {
                            $(field.selector).removeClass('is-valid').addClass('is-invalid');
                            $('#specify').removeClass('d-none');
                            $('#select').addClass('d-none');
                        }
                    } else {
                        $(field.selector).removeClass('is-invalid').addClass('is-valid');
                    }
                } else {
                    $(field.selector).removeClass('is-valid').addClass('is-invalid');
                }
                break;
            default:
                if (value !== '') {
                    $(field.selector).removeClass('is-invalid').addClass('is-valid');
                } else {
                    $(field.selector).removeClass('is-valid').addClass('is-invalid');
                }
                break;
        }
    });
}

/**
 * Checks if all of the required details for a booking
 * are filled in and displays a toast if the confirmation
 * is successful or not.
 */
function confirmBooking() {
    let userInputs;

    bindMissingFieldsEvents();
    showMissingFields();

    if (Object.values(stepsDone).every(Boolean)) {
        userInputs = {
            reservationNumber: `${performance.now().toString(36).slice(-6).padStart(6, '0').toLocaleUpperCase()}`,
            flightNumber: '123456789012123456789012',
            userId: '123456789012123456789012',
            email: `${$('#email-address').val().trim()}@${$('#domain-address').val().trim()}`,
            firstName: $('#first-name').val().trim(),
            lastName: $('#last-name').val().trim(),
            passportCode: $('#passport-code').val().trim(),
            seatNumber: $('#selected-seat').text().trim(),
        };

        fetch('/flight-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(userInputs)
        })
            .then(response => response.json())
            .then((result) => {
                if (result.success) {
                    showToast('#complete', `Booking confirmed under ${userInputs.reservationNumber}!`);

                    setTimeout(() => {
                        window.location.href = '/reservations';
                    }, 800);
                }
            });
    } else {
        showToast('#incomplete');
    }
}