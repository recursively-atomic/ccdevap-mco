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

async function checkCredentials(event) {
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    event.preventDefault();

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showToast('#good-outcome', `Successfully registered ${result.user.firstName} ${result.user.lastName}!`);

            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1000);
        } else if (!result.success) {
            if (response.status === 409) {
                showToast('#bad-outcome', 'This email is already taken!');
            }
        }
    } finally {
        form.reset();
    }
}

/**
 * Displays a toast with an optional display text.
 * 
 * @param {string} toastID the toast's ID.
 * @param {string} text the toast's display text.
 */
function showToast(toastID, text = '') {
    const toast = document.querySelector(toastID);
    const toastBody = toast.querySelector('.toast-body');

    document.activeElement.blur();

    if (text) {
        toastBody.textContent = text;
    }

    const toastInstance =
        bootstrap.Toast.getInstance(toast) ||
        new bootstrap.Toast(toast, {
            delay: 2000,
            autohide: true
        });

    toastInstance.show();
}