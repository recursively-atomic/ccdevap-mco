const stepsDone = { passengerInformation: false, mealSelection: false, seatSelection: false, extraService: false };
let baseFare, classFare = 0, taxAndFee = 400, extraFee = 0, step = 0;

$(function () {
    baseFare = parseInt($('#base-fare').text().replace(/\,/g, ''));

    getRequiredFields('flight-book');
    increaseProgress('mealSelection');
    increaseProgress('extraService');
    bindPassengerInformationEvents();
    checkPassengerInformation();
    showAgeBadge('flight-book');
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
 * Binds `checkPassengerInformation()` to all of the required fields for
 * a booking, whenever a field's input has changed.
 */
function bindPassengerInformationEvents() {
    requiredFields.forEach(function (field) {
        $(field.selector).off('input.check change.check').on('input.check change.check', function () {
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
        let value;

        try {
            value = $(field.selector).val().trim();
        } catch {
            value = $(field.selector).text().trim();
        }

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
                        field.value = value;
                    } else {
                        field.isFilled = false;
                        field.value = null;
                    }
                } else {
                    field.isFilled = false;
                    field.value = null;
                }
                break;
            case '#gender-select':
                if (value !== '') {
                    if (value === 'Not Listed') {
                        const otherGenderValue = $('#other-gender-input').val().trim();

                        if (otherGenderValue !== '') {
                            field.isFilled = true;
                            field.value = otherGenderValue;
                        } else {
                            field.isFilled = false;
                            field.value = null;
                        }
                    } else {
                        field.isFilled = true;
                        field.value = value;
                        requiredFields.find(field => field.selector === '#other-gender-input').isFilled = true;
                    }
                } else {
                    field.isFilled = false;
                    field.value = null;
                }
                break;
            case '#other-gender-input':
                if (requiredFields.find(field => field.selector === '#gender-select').isFilled == true) {
                    field.isFilled = true;
                    field.value = value;
                } else {
                    field.isFilled = false;
                    field.value = null;
                }
                break;
            case '#email-address':
                if (value !== '') {
                    const emailRequirements = /[^@\s]+@[^@\s]+\.[^@\s]{2,}/;

                    if (emailRequirements.test(value)) {
                        field.isFilled = true;
                        field.value = value;
                    } else {
                        field.isFilled = false;
                        field.value = null;
                    }
                } else {
                    field.isFilled = false;
                    field.value = null;
                }
                break;
            default:
                if (value !== '') {
                    field.isFilled = true;
                    field.value = value;
                } else {
                    field.isFilled = false;
                    field.value = null;
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
 * Displays a toast whenever the user picks a
 * different meal package and displays the chosen
 * meal package in the booking summary.
 */
function updateMealSelection() {
    const $selectedMeal = $('#selected-meal');

    $selectedMeal.text('Standard');
    $('#standard').prop('checked', true);

    $('input[name="meal-selection"]').off('change.meal').on('change.meal', function () {
        showToast('success-toast', `Changed meal type to ${$(this).next('label').text().trim().toLowerCase()} meal!`);
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

    $(".seat").off('click.seat').on('click.seat', function () {
        increaseProgress('seatSelection');

        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");

            showToast('success-toast', `Changed seat number to ${$(this).text().trim()}!`);
            classFare = 0;

            if ($(this).hasClass('economy')) {
                seatClass = 'Economy';
            } else if ($(this).hasClass('premium')) {
                seatClass = 'Premium';
                classFare += 500;
            } else if ($(this).hasClass('business')) {
                seatClass = 'Business';
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

    $('input[name="extra-services"], #additional-baggage').off('change.services').on('change.services', function () {
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
        `PHP ${baseFare.toLocaleString('en-US')} + PHP ${classFare.toLocaleString('en-US')}` : `PHP ${baseFare.toLocaleString('en-US')}`);

    $extraFee.text(extraFee > 0 ? 'PHP ' + extraFee.toLocaleString('en-US') : 'PHP 0');
    $taxAndFee.text(`PHP ${taxAndFee.toLocaleString('en-US')}`);
    $bookingTotal.text(`PHP ${(baseFare + classFare + taxAndFee + extraFee).toLocaleString('en-US')}`);
}

/**
 * Gets all of the important information about a reservation.
 * 
 * @returns {Object} an object of the user's inputs.
 */
async function getReservationData() {
    const [flight, user] = await Promise.all([
        fetch('/api/read-flight-number').then(response => response.json()),
        fetch('/api/read-user-number').then(response => response.json())
    ]);

    let reservationData = {
        identifier: `${Math.floor(performance.now()).toString(36).slice(-6).padStart(6, '0').toLocaleUpperCase()}`,
        flightNumber: parseInt(flight.flightNumber),
        userNumber: parseInt(user.userNumber),
        email: requiredFields.find(field => field.selector === '#email-address').value,
        firstName: requiredFields.find(field => field.selector === '#first-name').value,
        lastName: requiredFields.find(field => field.selector === '#last-name').value,
        passportCode: requiredFields.find(field => field.selector === '#passport-code').value,
        seatNumber: $('#selected-seat').text().trim(),
        totalAmount: baseFare + classFare + taxAndFee + extraFee
    };

    if ($('#suffix-select').val() != 'None') {
        reservationData.suffix = requiredFields.find(field => field.selector === '#suffix-select').value;
    }

    return reservationData;
}

/**
 * Checks if all of the required details for a booking
 * are filled in and displays a toast if the confirmation
 * is successful or not.
 */
async function confirmBooking() {
    bindMissingFieldsEvents('flight-book');
    showMissingFields('flight-book', null, 'flight-book');

    if (Object.values(stepsDone).every(Boolean)) {
        const reservationData = await getReservationData();

        try {
            const response = await fetch('/flight-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });
            const result = await response.json();

            if (result.success) {
                showToast('success-toast', `Booking confirmed under ${reservationData.identifier}!`);

                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1000);
            }
        } finally { }
    } else {
        showToast('warning-toast', 'Complete the booking details first!');
    }
}