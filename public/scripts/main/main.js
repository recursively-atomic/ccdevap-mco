let requiredFields;

/**
 * @param {*} toastID 
 * @param {*} text 
 */
function showToast(toastID, text = '') {
    const toastTemplate = document.getElementById(toastID);
    const container = document.getElementById('toast-container');
    const toastClone = toastTemplate.cloneNode(true);
    const toastBody = toastClone.querySelector('.toast-body');

    if (document.activeElement) {
        document.activeElement.blur();
    }

    if (toastBody && text) {
        toastBody.textContent = text;
    }

    toastClone.removeAttribute('id');
    container.appendChild(toastClone);

    const toastInstance = new bootstrap.Toast(toastClone, {
        delay: 2000,
        autohide: true,
    });

    toastInstance.show();
    toastClone.addEventListener('hidden.bs.toast', () => {
        toastClone.remove();
    });
}

/**
 * Hides a modal and shows a cloned toast with an optional display text.
 * @param {string} modalID the modal's ID.
 * @param {string} toastID id of the template toast element in the DOM.
 * @param {string} text the toast's display text.
 */
function hideModalShowToast(modalID, toastID, text = '') {
    const modal = document.getElementById(modalID);
    const toastTemplate = document.getElementById(toastID);
    const container = document.getElementById('toast-container');
    const toastClone = toastTemplate.cloneNode(true);
    const toastBody = toastClone.querySelector('.toast-body');

    if (document.activeElement) {
        document.activeElement.blur();
    }

    if (toastBody && text) {
        toastBody.textContent = text;
    }

    toastClone.removeAttribute('id');
    container.appendChild(toastClone);

    const modalInstance =
        bootstrap.Modal.getInstance(modal) ||
        new bootstrap.Modal(modal);

    const toastInstance = new bootstrap.Toast(toastClone, {
        delay: 2000,
        autohide: true,
    });

    modalInstance.hide();
    toastInstance.show();

    toastClone.addEventListener('hidden.bs.toast', () => {
        toastClone.remove();
    });
}

/**
 * Changes the sort and filter dropdown's display according
 * to the user's selection.
 */
function changeDropdownDisplay(sortHasSubmenu, filterHasSubmenu) {
    bindListItemValue('#sort-dropdown', '#sort-type', sortHasSubmenu);
    bindListItemValue('#filter-dropdown', '#filter-type', filterHasSubmenu);
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

    $dropdown.off('click.dropdown', '.dropdown-item').on('click.dropdown', '.dropdown-item', function (event) {
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

/**
 * Gets all the required fields by first getting the elements with the
 * `.required-field` class and getting their ids.
 */
function getRequiredFields(script) {
    requiredFields = $('.required-field').map(function () {
        const id = $(this).attr('id');
        const fieldData = {
            selector: '#' + id,
            isFilled: script == 'flight-book' ? (id === 'flight-type') : false
        };

        if (script == 'flight-search') {
            fieldData.value = null;
        }

        return fieldData;
    }).get();
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
function showMissingFields(script) {
    requiredFields.forEach(function (field) {
        const value = $(field.selector).val().trim();

        if (script === 'flight-search') {
            handleDefaultValidation(field, value);
            return;
        }

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
                handleDefaultValidation(field, value);
                break;
        }
    });
}

function handleDefaultValidation(field, value) {
    if (value !== '') {
        $(field.selector).removeClass('is-invalid').addClass('is-valid');
    } else {
        $(field.selector).removeClass('is-valid').addClass('is-invalid');
    }
}

function showAgeBadge(script) {
    const $dateContainer = $('#date-container');
    const $dateInput = $('#date-input');
    const $ageBadgeContainer = $('#age-badge-container');
    const $ageBadge = $('#age-badge');
    const $invalidInput = $('#invalid-input');
    const $noInput = $('#no-input');

    $dateInput.off('change.age').on('change.age', function () {
        const inputValue = $dateInput.val();

        if (inputValue) {
            const ageBadgeText = calculateAgeCategory(inputValue);

            if (ageBadgeText) {
                $dateInput.removeClass('is-invalid').addClass('is-valid');
                $ageBadge.text(ageBadgeText);

                if (script === 'profile') {
                    $dateContainer.removeClass('col-lg-12 col-md-12 col-sm-12 col-12');
                    $dateContainer.addClass('col-lg-11 col-md-10 col-sm-10 col-10');

                    $ageBadgeContainer.removeClass('d-none');
                    $ageBadgeContainer.addClass('col-lg-1 col-md-2 col-sm-2 col-2');
                } else {
                    $ageBadgeContainer.removeClass('d-none');
                }
            } else {
                $dateInput.removeClass('is-valid').addClass('is-invalid');

                if (script === 'profile') {
                    $dateContainer.removeClass('col-lg-11 col-md-10 col-sm-10 col-10');
                    $dateContainer.addClass('col-lg-12 col-md-12 col-sm-12 col-12');

                    $ageBadgeContainer.removeClass('col-lg-1 col-md-2 col-sm-2 col-2').addClass('d-none');
                } else {
                    $ageBadgeContainer.addClass('d-none');
                    $invalidInput.removeClass('d-none');
                    $noInput.addClass('d-none');
                }
            }
        } else {
            $dateInput.removeClass('is-valid').removeClass('is-invalid');

            if (script === 'profile') {
                $dateContainer.removeClass('col-lg-11 col-md-10 col-sm-10 col-10');
                $dateContainer.addClass('col-lg-12 col-md-12 col-sm-12 col-12');

                $ageBadgeContainer.removeClass('col-lg-1 col-md-2 col-sm-2 col-2').addClass('d-none');
            } else {
                $ageBadgeContainer.addClass('d-none');
            }
        }
    });
}

function calculateAgeCategory(birthDateString) {
    const currentDate = new Date();
    const birthDate = new Date(birthDateString);
    const differenceInDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));
    const ageCategories = [
        { label: 'Infant', min: 0, max: 730 },
        { label: 'Child', min: 731, max: 6570 },
        { label: 'Adult', min: 6571, max: 21900 },
        { label: 'Senior', min: 21901, max: Infinity }
    ];
    const ageCategory = ageCategories.find(category =>
        differenceInDays >= category.min && differenceInDays <= category.max
    );

    return ageCategory ? ageCategory.label : '';
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

async function bindLocations(originInput, destinationInput, script) {
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
            if (script === 'home') {
                originInput.append($('<option>', {
                    value: origin.location, 'data-code': origin.iata
                }));
            } else {
                originInput.append($('<option>', {
                    text: origin.location, 'data-iata': origin.iata, 'data-location': origin.location, 'data-name': origin.name
                }));
            }
        });

        destinationResult.destinations.forEach(destination => {
            if (script === 'home') {
                destinationInput.append($('<option>', {
                    value: destination.location, 'data-code': destination.iata
                }));
            } else {
                destinationInput.append($('<option>', {
                    text: destination.location, 'data-iata': destination.iata, 'data-location': destination.location, 'data-name': destination.name
                }));
            }
        });

        if (script === 'home') {
            originInput.data('options', originInput.html());
            destinationInput.data('options', destinationInput.html());
        }
    } finally { }
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

/**
 * Submits the login or registration form and handles the response.
 * @param {Event} event - the form submit event.
 * @param {string} mode - 'login' or 'register'.
 */
async function checkCredentials(event, script) {
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const endpoint = script === 'register' ? '/register' : '/login';

    event.preventDefault();

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (script === 'login' && response.redirected) {
            window.location.href = response.url;
            return;
        }

        const result = await response.json();

        if (script === 'register') {
            if (result.success) {
                showToast('success-toast', `Successfully registered ${result.user.firstName} ${result.user.lastName}!`);

                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1000);
            } else if (response.status === 409) {
                showToast('danger-toast', 'This email is already taken!');
            }
        } else {
            if (!result.success) {
                if (response.status === 404) {
                    showToast('danger-toast', 'User not found in the system!');
                } else if (response.status === 401) {
                    showToast('danger-toast', 'Incorrect credentials!');
                }
            }
        }
    } finally {
        form.reset();
    }
}

function togglePassword() {
    $('#toggle-password').off('click.password').on('click.password', function () {
        const $password = $('#password');
        const $icon = $('#toggle-icon');

        $password.attr('type', $password.attr('type') == 'password' ? 'text' : 'password');
        $icon.toggleClass('fa-eye fa-eye-slash');
    });
}