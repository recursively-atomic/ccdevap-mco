$(function () {    
    changeDropdownDisplay();

     loadUsers();

    $(document).on("click", ".delete-user", deleteUserRecord);
    $(document).on("click", ".edit-user", openEditModal);
    $("#save-edit-user").on("click", updateUserRecord);
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

    $dropdown.off('click', '.dropdown-item').on('click', '.dropdown-item', function (event) {
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

async function deleteUserRecord() {
    const id = $(this).data("id");
    if (!confirm("Delete this user?"))
        return;

    const response = await fetch(`/api/users/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();
    if (result.success) {
        loadUsers();

    } else {
        alert(result.message);
    }
}

async function loadUsers() {
    const response = await fetch("/api/users");
    const users = await response.json();

    let html = "";

    users.forEach((user, index) => {
        html += `
        <tr>

            <td>${index + 1}</td>
            <td>${user.role}</td>
            <td>Active</td>
            <td>${user.lastName}</td>
            <td>${user.firstName}</td>
            <td>${user.birthDate || "-"}</td>
            <td>${user.phoneNumber || "-"}</td>
            <td>${user.emailAddress}</td>
            <td>${user.savedPassengers ? user.savedPassengers.length : 0}</td>
            <td>
                <button
                    class="btn btn-success btn-sm text-white fw-bolder view-user"
                    data-id="${user._id}">
                    View
                </button>

                <button
                    class="btn btn-warning btn-sm text-white fw-bolder edit-user"
                    data-id="${user._id}">
                    Edit
                </button>

                <button
                    class="btn btn-danger btn-sm text-white fw-bolder delete-user"
                    data-id="${user._id}">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });
    $("#users-table-body").html(html);
}

async function openEditModal() {
    const id = $(this).data("id");
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();

    $("#edit-user-id").val(user._id);
    $("#edit-first-name").val(user.firstName);
    $("#edit-last-name").val(user.lastName);
    $("#edit-email").val(user.emailAddress);
    $("#edit-passport").val(user.passportCode);

    const modal = new bootstrap.Modal(
        document.getElementById("edit-activity")
    );
    modal.show();
}

async function updateUserRecord() {
    const id = $("#edit-user-id").val();
    const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: $("#edit-first-name").val(),
            lastName: $("#edit-last-name").val(),
            emailAddress: $("#edit-email").val(),
            passportCode: $("#edit-passport").val()
        })
    });

    const result = await response.json();

    if (result.success) {
        bootstrap.Modal.getInstance(
            document.getElementById("edit-activity")
        ).hide();
        loadUsers();
    }
}