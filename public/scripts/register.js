$(function () {
    togglePassword();
    getRequiredFields('register');
});

/**
 * Validates the register form's required fields before submission and
 * displays their validation status.
 */
function validateRegister() {
    const $emailAddress = $('#email-address');
    const $firstName = $('#first-name');
    const $lastName = $('#last-name');
    const $registerPassword = $('#register-password');

    bindMissingFieldsEvents('register');
    showMissingFields('register', null, 'register');

    if ($emailAddress.val().trim() && $firstName.val().trim() && $lastName.val().trim() && $registerPassword.val().trim()) {
        $emailAddress.removeClass('is-valid is-invalid');
        $firstName.removeClass('is-valid is-invalid');
        $lastName.removeClass('is-valid is-invalid');
        $registerPassword.removeClass('is-valid is-invalid');
    }
}