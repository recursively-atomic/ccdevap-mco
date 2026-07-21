
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
        format: (input) => input.toLocaleString('en-US')
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

if (process.env.NODE_ENV !== 'production') {
    const livereload = require("livereload");
    const connectLiveReload = require("connect-livereload");
    
    // Watch your templates and static assets directly
    const liveReloadServer = livereload.createServer({
        exts: ['hbs', 'css', 'js'],
        exclusions: [/node_modules/]
    });
    // Adjust "/views" and "/public" if your folders are named differently
    liveReloadServer.watch([__dirname + "/views", __dirname + "/public"]);

    // Middleware to inject the refresh script into your HBS views automatically
    server.use(connectLiveReload());

    // Instantly refreshes the browser after nodemon reboots the server
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });
}

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
