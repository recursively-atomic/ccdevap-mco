$(function () {
    togglePassword();
    getRequiredFields('login');
});

/**
 * Validates the login form's required fields before submission and
 * displays their validation status.
 */
function validateLogin() {
    bindMissingFieldsEvents('login');
    showMissingFields('login', null, 'login');

    if ($('#email-address').val().trim() && $('#password').val().trim()) {
        $('#email-address').removeClass('is-valid is-invalid');
        $('#password').removeClass('is-valid is-invalid');
    }
}