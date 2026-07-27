let requiredFields;

$(function () {
    getFlightLocations();
    getRequiredFields();
    showPriceRangeInput();
    bindSearchInformationEvents();
    checkSearchInformation();
    bindListItemValue('#sort-dropdown', '#sort-type', false);
    bindListItemValue('#filter-dropdown', '#filter-type', true);
});

async function getFlightLocations() {
    const $departureSelect = $('#departure-select');
    const $arrivalSelect = $('#arrival-select');

    await bindLocations($departureSelect, $arrivalSelect);
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
                })
            );
        });

        destinationResult.destinations.forEach(origin => {
            arrivalSelect.append(
                $('<option>', {
                    text: origin.location,
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

function getFlightsFromQuery() {
    const $departureSelect = $('#departure-select');
    const $arrivalSelect = $('#arrival-select');
    const $departureDate = $('#departure-date');

    console.log($departureSelect, $arrivalSelect, $departureDate);

    // try {
    //     const response = await fetch('/api/search');
    //     const result = response.json();

    //     if (result.success) {
    //         showToast('#complete', `Booking confirmed under ${reservationData.reservationNumber}!`);

    //         setTimeout(() => {
    //             window.location.href = '/reservations';
    //         }, 1000);
    //     }

    // } finally { }
}

/**
 * Checks if all of the required details for searching
 * a flight, and if successful, it will display the flight
 * resutls card.
 */
function searchFlights() {
    bindMissingFieldsEvents();
    showMissingFields();

    if (requiredFields.every(field => field.isFilled)) {
        $('#flight-results').removeClass('d-none').addClass('d-block');
    } else {
        $('#flight-results').removeClass('d-block').addClass('d-none');
    }

    await getFlightsFromQuery();
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