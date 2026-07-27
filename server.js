require('dotenv').config();

const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const server = express();

const { connectToMongo } = require('./private/connection');
const userRoutes = require("./private/routes/userRoutes");
const flightRoutes = require("./private/routes/flightRoutes");
const reservationRoutes = require('./private/routes/reservationRoutes');

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a == b,
        gt: (a, b) => a > b,
        gte: (a, b) => a >= b,
        lt: (a, b) => a < b,
        lte: (a, b) => a <= b,
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,

        range: (start, end) => {
            const arr = [];
            for (let i = start; i <= end; i++) arr.push(i);
            return arr;
        },

        or: (...args) => {
            args.pop();
            return args.some(Boolean);
        },

        and: (...args) => {
            args.pop();
            return args.every(Boolean);
        },

        formatNumber: (input) => input.toLocaleString('en-US'),
        formatTitleCase: (input) => input.toLowerCase().replace(/\b\w/g, character => character.toUpperCase()),
        getDate: (datetime) => {
            const options = {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            };

            return Intl.DateTimeFormat('en-US', options).format(datetime)
        },

        getTime: (datetime) => {
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };

            return Intl.DateTimeFormat('en-US', options).format(datetime);
        },

        getDuration: (departure, arrival) => {
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
        },

        pad: (input, length, padding) => String(input).padStart(length, padding),
        blank: (string) => a.length
    }
});

server.engine('hbs', handlebars.engine);

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

// ============================================================================
// RELOADS THE FRONTEND WHENEVER A CHANGE IS MADE
if (process.env.NODE_ENV !== 'production') {
    const livereload = require("livereload");
    const connectLiveReload = require("connect-livereload");
    const liveReloadServer = livereload.createServer({
        exts: ['hbs', 'css', 'js'],
        exclusions: [/node_modules/]
    });

    liveReloadServer.watch([__dirname + "/views", __dirname + "/public"]);
    server.use(connectLiveReload());
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 1);
    });
}
// ============================================================================

server.use("/", userRoutes);
server.use("/", flightRoutes);
server.use("/", reservationRoutes);

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});