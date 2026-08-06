const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const server = express();

const {
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
} = require('./private/helpers');

const { connectToServer } = require('./private/connection');
const userRoutes = require("./private/routes/userRoutes");
const flightRoutes = require("./private/routes/flightRoutes");
const reservationRoutes = require('./private/routes/reservationRoutes');
const auditRoutes = require("./private/routes/auditRoutes");

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
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
    }
});

server.engine('hbs', handlebars.engine);

server.set('trust proxy', true);
server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));

server.use(session({
    secret: "airline-secret-key",
    resave: false,
    saveUninitialized: false
}));

server.use("/", userRoutes);
server.use("/", flightRoutes);
server.use("/", reservationRoutes);
server.use("/", auditRoutes);

if (require.main === module) {
    connectToServer(server);
}

module.exports = server;