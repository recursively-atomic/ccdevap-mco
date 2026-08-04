function eq(a, b) {
    return a === b;
}

function gt(a, b) {
    return a > b;
}

function gte(a, b) {
    return a >= b;
}

function lt(a, b) {
    return a < b;
}

function lte(a, b) {
    return a <= b;
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function range(start, end) {
    const array = [];

    for (let i = start; i <= end; i++) {
        array.push(i)
    };

    return array;
}

function or(...inputs) {
    inputs.pop();

    return inputs.some(Boolean);
}

function and(...inputs) {
    inputs.pop();

    return inputs.every(Boolean);
}

function formatNumber(input) {
    return input.toLocaleString('en-US');
}

function formatTitleCase(input) {
    return input.toLowerCase().replace(/\b\w/g, character => character.toUpperCase());
}

function formatAuditLog(auditData) {
    const userNumber = getUserNumber(auditData.userRole, auditData.userNumber);
    let flightNumber, origin, originDate, originTime, destination, destinationDate, destinationTime;
    let reservationIdentifier, reservationSeat;

    if (auditData.flightNumber) {
        flightNumber = getFlightNumber(auditData.flightAirline, auditData.flightNumber);
        origin = auditData.flightRoute?.origin.airport;
        originDate = getDate(auditData.flightRoute?.origin.datetime);
        originTime = getTime(auditData.flightRoute?.origin.datetime);

        destination = auditData.flightRoute?.destination.airport;
        destinationDate = getDate(auditData.flightRoute?.destination.datetime);
        destinationTime = getTime(auditData.flightRoute?.destination.datetime);
    }

    if (auditData.reservationIdentifier) {
        reservationIdentifier = auditData.reservationIdentifier;
        reservationSeat = auditData.reservationSeat;
    }

    const auditString = {
        'u-reg': `Registered with an email of ${auditData.userEmail} and a user number of ${userNumber}.`,
        'u-lin': `Logged in with an email of ${auditData.userEmail} and a user number of ${userNumber}.`,
        'u-upd': `Updated their account to have an email of ${auditData.userEmail} and a user name of ${auditData.newUserName}.`,
        'u-lot': `Logged out of their account that uses an email of ${auditData.userEmail} and a user number of ${userNumber}.`,
        'f-cre': `Created flight ${flightNumber} that goes from ${origin} on ${originDate} ${originTime} to ${destination} on ${destinationDate} ${destinationTime}.`,
        'f-upd': `Updated flight ${flightNumber} to be ${String(auditData.flightStatus).toLowerCase()} which goes from ${origin} on ${originDate} ${originTime} to ${destination} on ${destinationDate} ${destinationTime}.`,
        'f-del': `Deleted flight ${flightNumber} that went from ${origin} on ${originDate} ${originTime} to ${destination} on ${destinationDate} ${destinationTime}.`,
        'r-cre': `Created a reservation under ${reservationIdentifier} for flight ${flightNumber} with a seat of ${reservationSeat}.`,
        'r-upd': `Updated their reservation under ${reservationIdentifier} for flight ${flightNumber} from seat ${reservationSeat} to seat ${auditData.newReservationSeat}.`,
        'r-can': `Cancelled their reservation under ${reservationIdentifier} for flight ${flightNumber} with a seat of ${reservationSeat}.`
    };

    return auditString[auditData.action];
}

function getDate(datetime) {
    const options = {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    };

    return Intl.DateTimeFormat('en-US', options).format(datetime)
}

function getSpecificTime(datetime) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 2,
        hour12: false
    };

    return Intl.DateTimeFormat('en-US', options).format(datetime);
}

function getTime(datetime) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return Intl.DateTimeFormat('en-US', options).format(datetime);
}

function getDuration(departure, arrival) {
    const difference = Math.abs(new Date(arrival) - new Date(departure));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    let display = [];

    if (days != 0) {
        display.push(`${days} D`);
    }

    if (hours != 0) {
        display.push(`${hours} H`);
    }

    if (minutes != 0) {
        display.push(`${minutes} M`);
    }

    return display.join(' ');
}

function getUserNumber(role, number) {
    const roleLegend = {
        'admin': 'ADM',
        'user': 'USR'
    };

    return `${roleLegend[role]} ${String(number).padStart(4, '0')}`;
}

function getAirlineLogo(airline) {
    const logoLegend = {
        'Cebu Atlantic': '/media/images/cebu-atlantic.png',
        'Filipino Airlines': '/media/images/filipino-airlines.png',
        'AirFAST': '/media/images/airfast.png',
        'Sunray Air': '/media/images/sunray-air.png'
    };

    return logoLegend[airline];
}

function getFlightNumber(airline, number) {
    const airlineLegend = {
        'Cebu Atlantic': 'CA',
        'Filipino Airlines': 'FA',
        'AirFAST': 'AF',
        'Sunray Air': 'SA'
    };

    return `${airlineLegend[airline]} ${String(number).padStart(4, '0')}`;
}

module.exports = {
    eq, gt, gte,
    lt, lte, add,
    subtract,
    range, or, and,
    formatNumber,
    formatTitleCase,
    formatAuditLog,
    getDate,
    getSpecificTime,
    getTime,
    getDuration,
    getUserNumber,
    getAirlineLogo,
    getFlightNumber
};