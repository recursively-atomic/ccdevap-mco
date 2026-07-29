let requiredFields;

/**
 * Shows a cloned toast with an optional display text.
 * 
 * @param {String} toastID is the id of the template toast.
 * @param {String} text is the toast's text.
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
 * 
 * @param {String} modalID is the modal's ID.
 * @param {String} toastID is the id of the template toast.
 * @param {String} text is the toast's text.
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
 * @param {String} dropdown is the dropdown id containing the `.dropdown-item` that was clicked.
 * @param {String} display is the id of the dropdown's text display.
 * @param {Boolean} hasSubmenu is a flag if the dropdown has submenus. 
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
 * 
 * 
 * Appends different metadata to the required fields depending
 * on who called the function.
 * 
 * @param {String} script is the caller's file name.
 */
function getRequiredFields(script) {
    requiredFields = $('.required-field').map(function () {
        const id = $(this).attr('id');
        const fieldData = {
            selector: '#' + id,
            group: $(this).data('group') || null,
            isFilled: script === 'flight-book' ? (id === 'flight-type') : false
        };

        if (script == 'flight-search') {
            fieldData.value = null;
        }

        return fieldData;
    }).get();
}

/**
 * Binds validation events to all required fields, or only to the
 * fields belonging to the specified validation group.
 *
 * @param {String} group is the validation group to bind events for.
 */
function bindMissingFieldsEvents(group) {
    let fields = requiredFields;

    if (group) {
        fields = requiredFields.filter(field => field.group === group);
    }

    fields.forEach(function (field) {
        $(field.selector)
            .off('input.show change.show')
            .on('input.show change.show', function () {
                showMissingFields(undefined, field.selector);
            });
    });
}

/**
 * Validates required fields and updates their validation state and
 * can be limited to a specific field or validation group.
 *
 * @param {String} script is the caller's file name.
 * @param {String} onlyField is the selector of the only field to validate.
 * @param {String} onlyGroup is the validation group to validate.
 */
function showMissingFields(script, onlyField, onlyGroup) {
    let fieldsToValidate = requiredFields;

    if (onlyField) {
        fieldsToValidate = requiredFields.filter(function (field) { return field.selector === onlyField; });
    } else if (onlyGroup) {
        fieldsToValidate = requiredFields.filter(function (field) { return field.group === onlyGroup; });
    }

    fieldsToValidate.forEach(function (field) {
        validateField(script, field);
    });
}

/**
 * Validates a required field according to the caller's validation rules.
 *
 * @param {String} script is the caller's file name.
 * @param {Object} field is the required field to be validated.
 */
function validateField(script, field) {
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
                    $('#date-invalid-input').addClass('d-none');
                    $('#date-no-input').addClass('d-none');
                } else {
                    $(field.selector).removeClass('is-valid').addClass('is-invalid');
                    $('#date-invalid-input').removeClass('d-none');
                    $('#date-no-input').addClass('d-none');
                }
            } else {
                $(field.selector).removeClass('is-valid').addClass('is-invalid');
                $('#date-invalid-input').addClass('d-none');
                $('#date-no-input').removeClass('d-none');
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
        case '#edit-email-address':
        case '#email-address':
            if (value !== '') {
                const emailRequirements = /[^@\s]+@[^@\s]+\.[^@\s]{2,}/;

                if (emailRequirements.test(value)) {
                    $(field.selector).removeClass('is-invalid').addClass('is-valid');
                    $('#email-invalid-input').addClass('d-none');
                    $('#email-no-input').addClass('d-none');
                } else {
                    $(field.selector).removeClass('is-valid').addClass('is-invalid');
                    $('#email-invalid-input').removeClass('d-none');
                    $('#email-no-input').addClass('d-none');
                }
            } else {
                $(field.selector).removeClass('is-valid').addClass('is-invalid');
                $('#email-invalid-input').addClass('d-none');
                $('#email-no-input').removeClass('d-none');
            }
            break;
        case '#new-password':
        case '#register-password':
            handlePasswordValidation(field, value);
            break;
        default:
            handleDefaultValidation(field, value);
            break;
    }
}

/**
 * Handles default data validation.
 * 
 * @param {String} field is the id of the field to be validated.
 * @param {String} value is the field's value.
 */
function handleDefaultValidation(field, value) {
    if (value !== '') {
        $(field.selector).removeClass('is-invalid').addClass('is-valid');
    } else {
        $(field.selector).removeClass('is-valid').addClass('is-invalid');
    }
}

function handlePasswordValidation(field, value) {
    const passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/;

    if (value !== '') {
        if (!passwordRequirements.test(value) || value.length < 8) {
            $(field.selector).removeClass('is-valid').addClass('is-invalid');
            $('#password-invalid-input').removeClass('d-none');
            $('#password-no-input').addClass('d-none');
        } else {
            $(field.selector).removeClass('is-invalid').addClass('is-valid');
            $('#password-invalid-input').addClass('d-none');
            $('#password-no-input').addClass('d-none');
        }
    } else {
        $(field.selector).removeClass('is-valid').addClass('is-invalid');
        $('#password-invalid-input').addClass('d-none');
        $('#password-no-input').removeClass('d-none');
    }
}

/**
 * Displays an age range badge depending on the user's data of birth.
 * 
 * 
 * Validates the date of birth depending on who called the function.
 * 
 * @param {String} script is the caller's file name.
 */
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

/**
 * Calculates age range of the user from their inputted birth date.
 * 
 * 
 * The age ranges are 'Infant', 'Child', 'Adult' and 'Senior'
 * 
 * @param {String} birthDateString is the user's birth date.
 * @returns the age range.
 */
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
 * Shows a 'Please Specify" text field when the user selects "Not Listed"
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
 * Fetches flight origins and destinations to append to elements.
 * 
 * 
 * Appends different metadata on the specified elements depending
 * on who called the function.
 * 
 * @param {String} originInput is the id of the element that will be appended with flight origins.
 * @param {String} destinationInput is the id of the element that will be appended with flight destinations.
 * @param {String} script is the caller's file name.
 */
async function bindLocations(originInput, destinationInput, script) {
    try {
        const [originResponse, destinationResponse] = await Promise.all([
            fetch('/api/get-flight-origins'),
            fetch('/api/get-flight-destinations')
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

/**
 * Updates the flight origin and destination options so a user can't
 * select the same location for both.
 * 
 * @param {HTMLElement} $origin is the element containing the flight origins.
 * @param {HTMLElement} $destination is the element containing the flight destinations.
 * @param {String} script is the caller's file name.
 */
function updateLocations($origin, $destination, script) {
    if (script === 'home') {
        const originCode = $('#origin').data('code');
        const destinationCode = $('#destination').data('code');

        const originOptions = $origin.data('options');
        const destinationOptions = $destination.data('options');

        $origin.html(originOptions);
        $destination.html(destinationOptions);

        if (originCode) {
            $destination.find(`option[data-code="${originCode}"]`).remove();
        }

        if (destinationCode) {
            $origin.find(`option[data-code="${destinationCode}"]`).remove();
        }
    } else {
        const originIata = $origin.find(':selected').data('iata');
        const destinationIata = $destination.find(':selected').data('iata');

        $origin.find('option:not([value=""])').prop('hidden', false).prop('disabled', false);
        $destination.find('option:not([value=""])').prop('hidden', false).prop('disabled', false);

        if (destinationIata) {
            $origin.find(`option[data-iata="${destinationIata}"]`).prop('hidden', true).prop('disabled', true);
        }

        if (originIata) {
            $destination.find(`option[data-iata="${originIata}"]`).prop('hidden', true).prop('disabled', true);
        }
    }
}

/**
 * Formats the duration of a flight from its departure and arrival datetime
 * to `# D # H # M`.
 * 
 * @param {Date} departure is the flight's departure from its origin in datetime.
 * @param {Date} arrival is the flight's arrival to its destination in datetime.
 * @returns the formatted string.
 */
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
 * 
 * 
 * Handles the response differently depending on who called the
 * function.
 * 
 * @param {SubmitEvent} event is the event of submitting a form.
 * @param {String} script is the caller's file name.
 */
async function checkCredentials(event, script) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const endpoint = script === 'register' ? '/register' : '/login';

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
                showToast('danger-toast', 'This e-mail is already taken!');
            } else if (response.status === 400) {
                showToast('warning-toast', 'Fill out the required fields first!');
            }
        } else {
            if (!result.success) {
                if (response.status === 404) {
                    showToast('danger-toast', 'User not found in the system!');
                } else if (response.status === 401) {
                    showToast('danger-toast', 'Incorrect credentials!');
                } else if (response.status === 400) {
                    showToast('warning-toast', 'Fill out the required fields first!');
                }
            } else {
                window.location.href = result.redirect;
            }
        }
    } finally {
        form.reset();
    }
}

/**
 * Toggles a password field's masking of the inputted text.
 */
function togglePassword() {
    $('.toggle-password').off('click.password').on('click.password', function () {
        const $icon = $(this).find('i');
        const $password = $($icon.data('target'));

        $password.attr('type', $password.attr('type') == 'password' ? 'text' : 'password');
        $icon.toggleClass('fa-eye fa-eye-slash');
    });
}