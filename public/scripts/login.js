$(function () {
    togglePassword();
});

function togglePassword() {
    $('#toggle-password').on('click', function () {
        const $password = $('#password');
        const $icon = $('#toggle-icon');

        $password.attr('type', $password.attr('type') == 'password' ? 'text' : 'password');
        $icon.toggleClass('fa-eye fa-eye-slash');
    });
}