let requiredFields;

$(function () {
    getFlightLocations();
    getRequiredFields();
    showPriceRangeInput();
    bindSearchInformationEvents();
    checkSearchInformation();
    bindListItemValue('#sort-dropdown', '#sort-type', false);
    bindListItemValue('#filter-dropdown', '#filter-type', true);

    $(document).on('click', '#search-results a[href*="page="]', function (event) {
        event.preventDefault();

        const href = $(this).attr('href');
        const page = new URLSearchParams(href.split('?')[1]).get('page');

        if (page) {
            performSearch(parseInt(page));
        }
    });
});

async function getFlightLocations() {
    const parameters = new URLSearchParams(window.location.search);
    const origin = parameters.get('origin');
    const destination = parameters.get('destination');

    const $departureSelect = $('#departure-select');
    const $arrivalSelect = $('#arrival-select');

    await bindLocations($departureSelect, $arrivalSelect);
    
    if (origin && destination) {
        $departureSelect.val(origin);
        $arrivalSelect.val(destination);

        updateDropdowns($departureSelect, $arrivalSelect);
    }

    $departureSelect.on('change', function () {
        updateDropdowns($departureSelect, $arrivalSelect);
    });

    $arrivalSelect.on('change', function () {
        updateDropdowns($departureSelect, $arrivalSelect);
    });
}

function updateDropdowns($departure, $arrival) {
    const departureIata = $departure.find(':selected').data('iata');
    const arrivalIata = $arrival.find(':selected').data('iata');

    $departure.find('option:not([value=""])').prop('hidden', false).prop('disabled', false);
    $arrival.find('option:not([value=""])').prop('hidden', false).prop('disabled', false);

    if (arrivalIata) {
        $departure.find(`option[data-iata="${arrivalIata}"]`).prop('hidden', true).prop('disabled', true);
    }

    if (departureIata) {
        $arrival.find(`option[data-iata="${departureIata}"]`).prop('hidden', true).prop('disabled', true);
    }
}

async function bindLocations(departureDropdown, arrivalSelect) {
    try {
        const [originResponse, destinationResponse] = await Promise.all([
            fetch('/api/flight-origins'),
            fetch('/api/flight-destinations')
        ]);

        const originResult = await originResponse.json();
        const destinationResult = await destinationResponse.json();

        if (!originResult.success || !destinationResult.success) {
            return;
        }

        originResult.origins.forEach(origin => {
            departureDropdown.append(
                $('<option>', {
                    text: origin.location,
                    'data-iata': origin.iata,
                    'data-location': origin.location,
                    'data-name': origin.name
                })
            );
        });

        destinationResult.destinations.forEach(destination => {
            arrivalSelect.append(
                $('<option>', {
                    text: destination.location,
                    'data-iata': destination.iata,
                    'data-location': destination.location,
                    'data-name': destination.name
                })
            );
        });
    } finally { }
}

/**
 * Gets all the required fields by first getting the elements with the
 * `.required-field` class and getting their ids.
 */
function getRequiredFields() {
    requiredFields = $('.required-field').map(function () {
        return {
            selector: '#' + $(this).attr('id'),
            isFilled: $(this).attr('id') === 'flight-type'
        };
    }).get();
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

    $minPriceInput.off('input').on('input', function () {
        if (parseInt($minPriceInput.val()) >= parseInt($maxPriceInput.val())) {
            $minPriceInput.val(parseInt($maxPriceInput.val()) - 5000);
        }

        $minPrice.val(parseInt($minPriceInput.val()).toLocaleString('en-US'));
    });

    $maxPriceInput.off('input').on('input', function () {
        if (parseInt($maxPriceInput.val()) <= parseInt($minPriceInput.val())) {
            $maxPriceInput.val(parseInt($minPriceInput.val()) + 5000);
        }

        $maxPrice.val(parseInt($maxPriceInput.val()).toLocaleString('en-US'));
    });
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

        // Checks if a field has the proper data, and flags
        // accordingly through the requireFields array.
        switch (field.selector) {
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
        const response = await fetch(`/api/search?${parameters.toString()}`);
        const result = await response.json();

        if (result.success) {
            $('#search-results').html(result.html);
        }
    } finally { }
}

/**
 * Checks if all of the required details for searching
 * a flight, and if successful, it will display the flight
 * resutls card.
 */
async function searchFlights() {
    bindMissingFieldsEvents();
    showMissingFields();

    if (requiredFields.every(field => field.isFilled)) {
        await performSearch(1);
        $('#flight-results').removeClass('d-none').addClass('d-block');
    } else {
        $('#flight-results').removeClass('d-block').addClass('d-none');
    }
}

/**
 * Searches the value that the dropdown's display should take
 * according to the `.dropdown-item` that the user selected.
 * 
 * @param {HTMLElement} dropdown is the dropdown containing the `.dropdown-item` that was clicked.
 * @param {HTMLElement} display is the dropdown's appending text display.
 * @param {Boolean} hasSubmenu is the flag if the dropdown has submenus. 
 */
function bindListItemValue(dropdown, display, hasSubmenu) {
    const $dropdown = $(dropdown);
    const $display = $(display);

    $dropdown.off('click', '.dropdown-item').on('click', '.dropdown-item', function (event) {
        const $dropdownItem = $(this);
        const $listItem = $(this).closest('li');
        const listItemValue = $listItem.attr('value');
        const $dropdownSubmenu = $(this).closest('.dropdown-submenu');

        $display.text(listItemValue);
        $dropdown.find('.dropdown-item').removeClass('active');
        $dropdownItem.addClass('active');

        if (hasSubmenu) {
            $dropdown.find('.dropdown-header-item').removeClass('active');
            $dropdownSubmenu.find('.dropdown-header-item').addClass('active');
        }
    });
}

function formatDuration(departure, arrival) {
    const difference = Math.abs(new Date(arrival) - new Date(departure));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    let display = [];

    if (days != 0) {
        display.push(`${days} D`);
    }

    if (hours != 0) {
        display.push(`${hours} H`);
    }

    if (minutes != 0) {
        display.push(`${minutes} M`);
    }

    return display.join(' ');
}

async function showViewModal(flightNumber) {
    const $viewModal = $('#view-flight');
    const $title = $viewModal.find('.modal-title');

    const $statusBagde = $('#status-badge');
    const $capacityBadge = $('#capacity-badge');

    const dateOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    try {
        const response = await fetch(`/api/flight/${flightNumber}`);
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const flightData = result.flightData;
        let airline = flightData.airline;
        let originAirport = flightData.originAirport;
        let destinationAirport = flightData.destinationAirport;
        let capacity = flightData.availableSeats;
        let status = flightData.flightStatus;

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

async function continueBooking(flightNumber) {
    window.location.href = `/api/select-flight/${flightNumber}`;
}