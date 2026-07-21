$('#toggle-password').on('click', function () {
    const $password = $('#password-field');
    const $icon = $('#toggle-password-icon');
    
    $password.attr('type', $password.attr('type') == 'password' ? 'text' : 'password');
    $icon.toggleClass('fa-eye fa-eye-slash');
});