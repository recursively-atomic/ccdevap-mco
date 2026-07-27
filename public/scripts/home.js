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
    await bindLocations($origin, $destination);

    $('#origin, #destination').off('focus').on('focus', function () {
        $(this).val('');
        $(this).removeData('code');
    });

    $('#origin, #destination').off('change').on('change', function () {
        const $textField = $(this);
        const $data = $textField.attr('id') === 'origin' ? $origin : $destination;
        const $match = $data.find('option').filter(function () {
            return $(this).val() === $textField.val();
        }).first();

        let code, location, originCode, destionationCode;

        if (!$match.length) {
            return;
        }

        code = $match.attr('data-code');
        location = $match.val();
        originCode = $('#origin').data('code');
        destinationCode = $('#destination').data('code');

        $textField.data('code', code);
        $textField.val(`${location} ${code}`);

        if ((originCode && destinationCode) && originCode === destinationCode) {
            $textField.val('');
            $textField.removeData('code');
            $textField.focus();
        }
    });
}

async function bindLocations(originInput, destinationInput) {
    try {
        const [originResponse, destinationResponse] = await Promise.all([
            fetch('/api/flight-origins'),
            fetch('/api/flight-destinations')
        ]);

        const originResult = await originResponse.json();
        const destinationResult = await destinationResponse.json();

        if (!originResult.success || !destinationResult.success) {
            return;
        }

        originResult.origins.forEach(origin => {
            originInput.append(
                $('<option>', {
                    value: origin.location,
                    'data-code': origin.iata
                })
            );
        });

        destinationResult.destinations.forEach(destination => {
            destinationInput.append(
                $('<option>', {
                    value: destination.location,
                    'data-code': destination.iata
                })
            );
        });
    } finally { }
}