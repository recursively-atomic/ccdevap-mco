$(function () {
    autocompleteLocations();
});

/**
 * Provides autocomplete to the origin and destination text input
 * in the flight search quick widget.
 */
async function autocompleteLocations() {
    const $origin = $('#origin-result');
    const $destination = $('#destination-result');

    $origin.empty();
    $destination.empty();

    await bindLocations($origin, $destination, 'home');

    $('#origin, #destination').off('focus.field').on('focus.field', function () {
        $(this).val('');
        $(this).removeData('code');
    });

    $('#origin, #destination').off('change.text').on('change.text', function () {
        const $textField = $(this);
        const $data = $textField.attr('id') === 'origin' ? $origin : $destination;
        const $match = $data.find('option').filter(function () {
            return $(this).val() === $textField.val();
        }).first();

        let code, location;

        if (!$match.length) {
            return;
        }

        code = $match.attr('data-code');
        location = $match.val();

        $textField.data('code', code);
        $textField.val(`${location} ${code}`);
        updateLocations($origin, $destination, 'home');
    });
}

/**
 * Gets the user's input from the quick flight search widget
 * and carries the data over to `flight-search`.
 * 
 * @param {SubmitEvent} event is the event of submitting a form.
 */
async function continueSearch(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    let parameters;

    data['origin'] = data['origin'].split(' ')[0];
    data['destination'] = data['destination'].split(' ')[0];
    parameters = new URLSearchParams(data);
    window.location.href = `/flight-search?${parameters.toString()}`;
}