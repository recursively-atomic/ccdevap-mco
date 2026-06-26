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
 * Hides a modal and shows a toast.
 * 
 * @param {string} modalID the modal's ID.
 * @param {string} toastID the toast's ID.
 */
function hideModalShowToast(modalID, toastID) {
    const modal = document.getElementById(modalID);
    const toast = document.getElementById(toastID);

    document.activeElement.blur();

    const modalInstance =
        bootstrap.Modal.getInstance(modal) ||
        new bootstrap.Modal(modal);

    const toastInstance =
        bootstrap.Toast.getInstance(toast) ||
        new bootstrap.Toast(toast, {
            delay: 2000,
            autohide: true
        });

    modalInstance.hide();
    toastInstance.show();
}