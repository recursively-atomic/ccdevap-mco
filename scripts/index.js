$(function () {
    autocompleteLocations();
});

/**
 * Provides autocomplete to the origin and destination text input
 * in the flight search quick widget.
 */
function autocompleteLocations() {
    const $data = $('#result');
    
    // Sample data of airports
    const locations = [
        { name: 'Bacolod', code: 'BCD' },
        { name: 'Cagayan de Oro', code: 'CGY' },
        { name: 'Davao', code: 'DVO' },
        { name: 'El Nido', code: 'ENI' },
        { name: 'General Santos', code: 'GES' },
        { name: 'Iloilo', code: 'ILO' },
        { name: 'Kalibo', code: 'KLO' },
        { name: 'Laoag', code: 'LAO' },
        { name: 'Manila', code: 'MNL' },
        { name: 'Naga', code: 'WNP' },
        { name: 'Ozamiz', code: 'OZC' },
        { name: 'Pagadian', code: 'PAG' },
        { name: 'Roxas', code: 'RXS' },
        { name: 'San Jose, Mindoro', code: 'SJI' },
        { name: 'Tacloban', code: 'TAC' },
        { name: 'Virac', code: 'VRC' },
        { name: 'Zamboanga', code: 'ZAM' }
    ];

    // Populating the datalist with all the sample data
    locations.forEach(location => {
        const $option = $('<option>').val(location.name).attr('data-code', location.code);

        $data.append($option);
    });

    // Updating the datalist when a user inputs something
    $('#origin, #destination').on('change', function () {
        const $input = $(this);
        const value = $input.val();
        let $match, code, location;

        $match = $data.find('option').filter(function () {
            return $(this).val() === value;
        }).first();

        code = $match.attr('data-code');
        location = $match.attr('value');

        $input.val(location + " " + code);
    });
}