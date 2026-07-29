$(function () {
    showAgeBadge('profile');
    showSpecifyGender();
    showInputFields();
    updateProfilePage();

    $('#change-profile').on('change.picture', changeProfile);
    $('#card-number').on('input.card', (event) => formatCardNumber(event.target));
    $('#save-profile-btn').on('click.save', updateProfileInformation);
    $('#save-password-btn').on('click.save', updatePassword);
});

/**
 * Changes a user's profile picture depending on their selected
 * image file from their local storage.
 */
function changeProfile(event) {
    const file = event.target.files[0];

    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function (secondEvent) {
            $('#profile-picture').attr('src', secondEvent.target.result);
        };

        fileReader.readAsDataURL(file);
    }
}

/**
 * Clears all of the input fields connected to selecting a
 * preferred payment method with credit or debit cards.
 */
function clearCardFields() {
    $('#card-first-name').val('');
    $('#card-last-name').val('');

    $('#receipt-email').val('');
    $('#receipt-domain').val('');

    $('#billing-country').val('');
    $('#billing-region').val('');
    $('#zip-code').val('');

    $('#card-number').val('');
    $('#card-expiry').val('');
    $('#card-cvn').val('');

    $('#billing-address-1').val('');
    $('#billing-address-2').val('');
}

/**
 * Clears all of the input fields connected to selecting a
 * preferred payment method with digital wallets.
 */
function clearDigitalWalletFields() {
    $('#account-name').val('');
    $('#account-number').val('');
}
/**
 * Formats the card number field into XXXX XXXX XXXX XXXX.
 */
function formatCardNumber(input) {
    const inputValue = input.value;

    // Gets the cursor's old position before text formatting
    const oldPosition = input.selectionStart;

    // Removes non-digits and caps it to 16 digits
    const digits = inputValue.replace(/\D/g, '').slice(0, 16);

    // Adds a space every 4 digits
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    let difference, newPosition;

    // Sets the card number's input to the formatted input
    input.value = formatted;

    // Calculates the difference of the length of the old to the formatted input
    difference = input.value.length - inputValue.length;

    // Calculates the expected cursor position after the formatting has been done
    newPosition = oldPosition + difference;

    // The new position will be within the bounds of the user's input
    newPosition = Math.max(0, Math.min(newPosition, input.value.length));

    // Sets the cursor's new position
    input.setSelectionRange(newPosition, newPosition);
}

/**
 * Shows input fields corresponding to the payment method that
 * the user chose in the payment method dropdown.
 */
function showInputFields() {
    const $paymentMethodSelect = $('#payment-method-select');

    $('#card-input-fields, #digital-input-fields').addClass('d-none');

    $paymentMethodSelect.off('change.payment').on('change.payment',
        (event) => handleFieldVisibility($(event.target).val()));
}

/**
 * Makes certain fields visible or not depending on the user's
 * preferred payment method.
 * 
 * @param {String} value is the user's selected payment method preference.
 */
function handleFieldVisibility(value) {
    const $cardInputFields = $('#card-input-fields');
    const $digitalInputFields = $('#digital-input-fields');

    switch (value) {
        case 'Credit Card':
        case 'Debit Card':
            $cardInputFields.removeClass('d-none');
            $digitalInputFields.addClass('d-none');

            clearCardFields();
            updateProfilePage();
            break;
        case 'Digital Wallet':
            $digitalInputFields.removeClass('d-none');
            $cardInputFields.addClass('d-none');

            clearDigitalWalletFields();
            updateProfilePage();
            break;
        case 'Cash':
        default:
            $cardInputFields.addClass('d-none');
            $digitalInputFields.addClass('d-none');

            clearCardFields();
            clearDigitalWalletFields();
            updateProfilePage();
            break;
    }
}

/**
 * Updates the user's profile to match the changes they made.
 */
function updateProfilePage() {
    const name = $('#profile-name').text().trim();
    const [last, first] = name.split(',');
    const email = $('#profile-email').text().trim();
    const [username, domain] = email.split('@');
    const contact = $('#profile-contact').text().trim();
    const [codeOnly, numberOnly] = contact.split(' ');

    $('#account-name').val(`${first} ${last}`);
    $('#card-first-name').val(first);
    $('#card-last-name').val(last);

    $('#email-address').val(username);
    $('#domain-address').val(domain);
    $('#receipt-email').val(username);
    $('#receipt-domain').val(domain);

    $('#phone-code').val(codeOnly.replace(/\+/g, ''));
    $('#phone-number').val(numberOnly);

    if ($('#profile-contact').text().trim() == 0) {
        $('#profile-contact').closest('div').addClass('d-none');
    } else {
        $('#profile-contact').closest('div').removeClass('d-none');
    }
}

/**
 * Opens a modal for users to edit their profile information.
 */
function showEditModal() {
    const email = $('#profile-email').text().trim();
    const [username, domain] = email.split('@');
    const contact = $('#profile-contact').text().trim();
    const [code, number] = contact.split(' ');

    $('#edit-first-name').val($('#profile-name').data('first-name'));
    $('#edit-last-name').val($('#profile-name').data('last-name'));

    $('#edit-email-user').val(username);
    $('#edit-email-domain').val(domain);

    $('#edit-phone-code').val(code.replace(/\+/g, ''));
    $('#edit-phone-number').val(number);
}

/**
 * Updates a user's profile information and displays a toast
 * on the process' result.
 */
async function updateProfileInformation() {
    const code = $('#edit-phone-code').val().trim() ? '+' + $('#edit-phone-code').val().trim() : '';
    const number = $('#edit-phone-number').val().trim() ? $('#edit-phone-number').val().trim() : '';

    const data = {
        firstName: $('#edit-first-name').val().trim(),
        lastName: $('#edit-last-name').val().trim(),
        emailAddress: $('#edit-email-user').val().trim() + '@' + $('#edit-email-domain').val().trim(),
        contactNumber: code && number ? code + ' ' + number : ''
    };

    const response = await fetch('/api/update-user-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.success) {
        showToast('danger-toast', 'Failed to update profile!');
        return;
    }

    $('#profile-name').text(result.user.lastName + ', ' + result.user.firstName);
    $('#profile-email').text(result.user.emailAddress);
    $('#profile-contact').text(result.user.contactNumber);

    updateProfilePage();
    hideModalShowToast('update-profile', 'success-toast', 'Profile updated successfully!');
}


/**
 * Updates a user's password and displays a toast
 * on the process' result.
 */
async function updatePassword() {
    const currentPassword = $('#current-password').val().trim();
    const newPassword = $('#new-password').val().trim();

    if (!currentPassword || !newPassword) {
        showToast('warning-toast', 'Fill in both password fields!');
        return;
    }

    try {
        const response = await fetch('/api/update-user-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();

        if (result.success) {
            $('#current-password').val('');
            $('#new-password').val('');
            showToast('success-toast', 'Successfully changed password!');
        }
    } finally { }
}