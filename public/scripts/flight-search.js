$(function () {
    getFlightLocations();
    getRequiredFields('flight-search');
    showPriceRangeInput();
    bindSearchInformationEvents();
    checkSearchInformation();
    changeDropdownDisplay(false, true);

    $(document).on('click.search', '#search-results a[href*="page="]', function (event) {
        event.preventDefault();
        const href = $(this).attr('href');
        const page = new URLSearchParams(href.split('?')[1]).get('page');

        if (page) {
            performSearch(parseInt(page));
        }
    });
});

/**
 * Gets the origins and destionas of all flights from the datablase.
 */
async function getFlightLocations() {
    const parameters = new URLSearchParams(window.location.search);
    const origin = parameters.get('origin');
    const destination = parameters.get('destination');

    const $departureSelect = $('#departure-select');
    const $arrivalSelect = $('#arrival-select');

    await bindLocations($departureSelect, $arrivalSelect, 'flight-search');

    if (origin && destination) {
        $departureSelect.val(origin);
        $arrivalSelect.val(destination);

        updateLocations($departureSelect, $arrivalSelect, 'flight-search');
    }

    $departureSelect.off('change.origin').on('change.origin', function () {
        updateLocations($departureSelect, $arrivalSelect, 'flight-search');
    });

    $arrivalSelect.off('change.destination').on('change.destination', function () {
        updateLocations($departureSelect, $arrivalSelect, 'flight-search');
    });
}

/**
 * Binds `checkSearchInformation()` to all of the required fields for
 * searching a flight, whenever a field's input has changed.
 */
function bindSearchInformationEvents() {
    requiredFields.forEach(function (field) {
        $(field.selector).off('input.check').on('input.check', function () {
            checkSearchInformation();
        });
    });
}

/**
 * Keeps track if the required fields in the flight search
 * card are filled with proper information.
 */
function checkSearchInformation() {
    requiredFields.forEach(function (field) {
        const value = $(field.selector).val().trim();

        // Checks if a field has the proper data, and flags
        // accordingly through the requireFields array.
        switch (field.selector) {
            default:
                if (value !== '') {
                    field.isFilled = true;
                } else {
                    field.isFilled = false;
                }
                break;
        }
    });
}

/**
 * Dynamically displays the user's specified price range,
 */
function showPriceRangeInput() {
    const $minPriceInput = $('#min-price-input');
    const $maxPriceInput = $('#max-price-input');
    const $minPrice = $('#min-price');
    const $maxPrice = $('#max-price');

    $minPriceInput.off('input.max').on('input.max', function () {
        if (parseInt($minPriceInput.val()) >= parseInt($maxPriceInput.val())) {
            $minPriceInput.val(parseInt($maxPriceInput.val()) - 5000);
        }

        $minPrice.val(parseInt($minPriceInput.val()).toLocaleString('en-US'));
    });

    $maxPriceInput.off('input.min').on('input.min', function () {
        if (parseInt($maxPriceInput.val()) <= parseInt($minPriceInput.val())) {
            $maxPriceInput.val(parseInt($minPriceInput.val()) + 5000);
        }

        $maxPrice.val(parseInt($maxPriceInput.val()).toLocaleString('en-US'));
    });
}

/**
 * Searches flights from the user's query.
 * 
 * @param {String} page is a tracker of what search results to display.
 */
async function performSearch(page) {
    const $departureOption = $('#departure-select').find('option:selected');
    const $arrivalOption = $('#arrival-select').find('option:selected');
    const query = {
        departureIata: $departureOption.attr('data-iata'),
        arrivalIata: $arrivalOption.attr('data-iata'),
        departureDate: $('#departure-date').val(),
    };

    const parameters = new URLSearchParams({ ...query, page });

    try {
        const response = await fetch(`/api/search-flight?${parameters.toString()}`);
        const result = await response.json();

        if (result.success) {
            $('#search-results').html(result.html);
        }
    } finally { }
}

/**
 * Checks if all of the required details for searching
 * a flight and display the flight resutls card, if successful.
 */
async function searchFlights() {
    bindMissingFieldsEvents('flight-search');
    showMissingFields('flight-search', null, 'flight-search');

    if (requiredFields.every(field => field.isFilled)) {
        await performSearch(1);
        $('#flight-results').removeClass('d-none').addClass('d-block');
    } else {
        $('#flight-results').removeClass('d-block').addClass('d-none');
        showToast('warning-toast', 'Fill out the required fields first!');
    }
}

/**
 * Displays a flight's details in a modal.
 * 
 * @param {String} flightNumber is the flight number.
 */
async function showViewModal(flightNumber) {
    const $viewModal = $('#view-flight');
    const $title = $viewModal.find('.modal-title');

    const $statusBagde = $('#status-badge');
    const $capacityBadge = $('#capacity-badge');

    const dateOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    try {
        const response = await fetch(`/api/read-flight/${flightNumber}`);
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const flightData = result.flightData;
        let airline = flightData.airline;
        let originAirport = flightData.originAirport;
        let destinationAirport = flightData.destinationAirport;
        let capacity = flightData.availableSeats;
        let status = flightData.status;

        airline = airline == 'Cebu Atlantic' ? 'CA' : airline == 'Filipino Airlines' ? 'FA' : airline == 'AirFAST' ? 'AF' : 'SA';
        $title.text(`${airline} ${String(flightData.flightNumber).padStart(4, '0')} Details`);

        $('#flight-number').text(`${airline} ${String(flightData.flightNumber).padStart(4, '0')}`);
        $('#flight-fare').text(`PHP ${(flightData.baseFare).toLocaleString('en-US')}`);

        $('#departure-iata').text(originAirport.iata);
        $('#departure-location').text(originAirport.location);
        $('#departure-name').text(originAirport.name);
        $('#departure-day').text(Intl.DateTimeFormat('en-US', dateOptions).format(new Date(flightData.departureDatetime)));
        $('#departure-time').text(Intl.DateTimeFormat('en-US', timeOptions).format(new Date(flightData.departureDatetime)));

        $('#arrival-iata').text(destinationAirport.iata);
        $('#arrival-location').text(destinationAirport.location);
        $('#arrival-name').text(destinationAirport.name);
        $('#arrival-day').text(Intl.DateTimeFormat('en-US', dateOptions).format(new Date(flightData.arrivalDatetime)));
        $('#arrival-time').text(Intl.DateTimeFormat('en-US', timeOptions).format(new Date(flightData.arrivalDatetime)));

        if (status == 'Cancelled') {
            $statusBagde.text(status);
            $statusBagde.addClass('text-bg-danger');
        } else if (status == 'Delayed' || status == 'Rescheduled') {
            $statusBagde.text('status');
            $statusBagde.addClass('text-bg-warning');
        } else if (status == 'Scheduled' || status == 'In Air') {
            $statusBagde.text(status);
            $statusBagde.addClass('text-bg-success');
        }

        if (capacity == 0) {
            $capacityBadge.text('Full Flight');
            $capacityBadge.addClass('text-bg-danger');
        } else if (capacity <= 5) {
            $capacityBadge.text('Limited Seats');
            $capacityBadge.addClass('text-bg-warning');
        } else if (capacity >= 6 && capacity <= 16) {
            $capacityBadge.text('Available Flight');
            $capacityBadge.addClass('text-bg-success');
        }

        $('#duration-badge').text(formatDuration(flightData.departureDatetime, flightData.arrivalDatetime));
    } finally { }
}

/**
 * Gets the user's selection in the search results and carries
 * the data over to `flight-book`.
 * 
 * @param {String} flightNumber is the flight number the user selected to book under.
 */
async function continueBooking(flightNumber) {
    window.location.href = `/api/select-flight/${flightNumber}`;
}