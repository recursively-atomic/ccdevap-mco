let requiredFields;

const templateSource = document.getElementById('resultsTemplate').innerHTML;
const template = Handlebars.compile(templateSource);

document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Serialize form data
  const formData = new FormData(this);
  const queryParams = new URLSearchParams(formData).toString();

  // Send AJAX request
  fetch(`/api/search?${queryParams}`)
    .then(response => response.json())
    .then(data => {
      // Render data into Handlebars template
      const html = template({ results: data });
      document.getElementById('resultsContainer').innerHTML = html;
    })
    .catch(error => console.error('Error fetching data:', error));
});

$(function () {
    getRequiredFields();
    showPriceRangeInput();
    bindSearchInformationEvents();
    checkSearchInformation();
    bindListItemValue('#sort-dropdown', '#sort-type', false);
    bindListItemValue('#filter-dropdown', '#filter-type', true);
});

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
            case '#flight-type':
                if ($(`${field.selector} > input[name='trip-type']:checked`).length) {
                    const flightType = $((`${field.selector} > input[name='trip-type']:checked`)).val();
                    const arrivalSelect = requiredFields.find(field => field.selector == '#arrival-select');
                    const arrivalDate = requiredFields.find(field => field.selector == '#arrival-date');

                    if (flightType === 'one-way') {
                        arrivalSelect.isFilled = true;
                        arrivalDate.isFilled = true;

                        $(arrivalSelect.selector).removeClass('bg-light text-black').addClass('bg-dark text-dark');
                        $(arrivalSelect.selector).val('').prop('disabled', true);

                        $(arrivalDate.selector).removeClass('bg-light text-black').addClass('bg-dark text-dark');
                        $(arrivalDate.selector).attr('type', 'text').val('-').prop('disabled', true);
                    } else if (flightType === 'round-trip') {
                        if ($(arrivalSelect.selector).val() !== '') {
                            arrivalSelect.isFilled = true;
                        } else {
                            arrivalSelect.isFilled = false;
                        }

                        if ($(arrivalDate.selector).val() !== '') {
                            arrivalDate.isFilled = true;
                        } else {
                            arrivalDate.isFilled = false;
                        }

                        $(arrivalSelect.selector).removeClass('bg-dark text-dark').addClass('bg-light text-black').prop('disabled', false);
                        $(arrivalDate.selector).removeClass('bg-dark text-dark').addClass('bg-light text-black');
                        $(arrivalDate.selector).attr('type', 'date').prop('disabled', false);
                    }
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
            case '#flight-type':
                if ($(`${field.selector} > input[name='trip-type']:checked`).length) {
                    const flightType = $((`${field.selector} > input[name='trip-type']:checked`)).val();
                    const arrivalSelect = requiredFields.find(field => field.selector == '#arrival-select');
                    const arrivalDate = requiredFields.find(field => field.selector == '#arrival-date');

                    if (flightType === 'one-way') {
                        $(arrivalSelect.selector).removeClass('is-invalid').addClass('is-valid');
                        $(arrivalDate.selector).removeClass('is-invalid').addClass('is-valid');
                    } else if (flightType === 'round-trip') {
                        if ($(arrivalSelect.selector).val() !== '') {
                            $(arrivalSelect.selector).removeClass('is-invalid').addClass('is-valid');
                        } else {
                            $(arrivalSelect.selector).removeClass('is-valid').addClass('is-invalid');
                        }

                        if ($(arrivalDate.selector).val() !== '') {
                            $(arrivalDate.selector).removeClass('is-invalid').addClass('is-valid');
                        } else {
                            $(arrivalDate.selector).removeClass('is-valid').addClass('is-invalid');
                        }
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
