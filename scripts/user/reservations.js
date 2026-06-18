$(function () {
    changeDropdownDisplay();
});

/**
 * Changes the sort and filter dropdown's display according
 * to the user's selection.
 */
function changeDropdownDisplay() {
    bindListItemValue('#sort-dropdown', '#sort-type');
    bindListItemValue('#filter-dropdown', '#filter-type');
}

/**
 * Searches the value that the dropdown's display should take
 * according to the `.dropdown-item` that the user selected.
 * 
 * @param {HTMLElement} dropdown is the dropdown containing the `.dropdown-item` that was clicked.
 * @param {HTMLElement} display is the dropdown's appending text display.
 */
function bindListItemValue(dropdown, display) {
    const $dropdown = $(dropdown);
    const $display = $(display);

    $dropdown.on('click', '.dropdown-item', function (event) {
        const $dropdownItem = $(this);
        const $listItem = $(this).closest('li');
        const listItemValue = $listItem.attr('value');

        $display.text(listItemValue);
        $dropdown.find('.dropdown-item').removeClass('active');
        $dropdownItem.addClass('active');
    });
}

/**
 * Shows a toast whenever the user edits a reservation.
 */
function showEditToast() {
    const editToast = $('#edit-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(editToast) ||
        new bootstrap.Toast(editToast, { delay: 2000, autohide: true });

    baseToast.show();
}

/**
 * Shows a toast whenever the user cancels a reservation.
 */
function showCancelToast() {
    const cancelToast = $('#cancel-toast').get(0);

    const baseToast =
        bootstrap.Toast.getInstance(cancelToast) ||
        new bootstrap.Toast(cancelToast, { delay: 2000, autohide: true });

    baseToast.show();
}