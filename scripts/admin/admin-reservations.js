/**
 * Shows a toast whenever the user deletes a reservation.
 */
function showDeleteToast() {
    const deleteToast = $('#delete-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(deleteToast) ||
        new bootstrap.Toast(deleteToast, { delay: 2000, autohide: true });

    baseToast.show();
}