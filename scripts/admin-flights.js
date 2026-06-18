/**
 * Shows a toast whenever the user adds a flight.
 */
function showAddToast() {
    const addToast = $('#add-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(addToast) ||
        new bootstrap.Toast(addToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user edits a flight.
 */
function showEditToast() {
    const editToast = $('#edit-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(editToast) ||
        new bootstrap.Toast(editToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user deletes a flight.
 */
function showDeleteToast() {
    const deleteToast = $('#delete-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(deleteToast) ||
        new bootstrap.Toast(deleteToast, { delay: 2000, autohide: true });

    baseToast.show();
}