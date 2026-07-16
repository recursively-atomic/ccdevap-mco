require('dotenv').config();

const Users = require('./private/models/users');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { getSeatMap, getReservations, createReservation, updateSeat, updateStatus } = require('./private/controllers/reservations');
const server = express();

const session = require("express-session");
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    changePassword
} = require('./private/controllers/users');

const server = express();

server.use(session({
    secret: "airline-secret-key",
    resave: false,
    saveUninitialized: false
}));

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

const userRole = 'admin';
// For testing lang

server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public'))); // Exposes every file in the public folder

server.get('/', (req, res) => {
    res.render('index', {
        page: '/',
        script: '/scripts/index.js',
        role: userRole
    });
});

server.get("/register", (req, res) => {
    res.render('register', { message: "user registration page" });
});

server.get('/flight-book', async (req, res) => {
    try {
        const seatMap = await getSeatMap("TESTFLIGHT");

        res.status(200).render('booking', {
            page: '/flight-book',
            script: '/scripts/user/booking.js',
            role: userRole,
            seats: seatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.post('/flight-book', async (req, res) => {
    try {
        const reservation = await createReservation(req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.put('/api/:reservationNumber', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const { seatNumber } = req.body;

        const updatedReservation = await updateSeat(reservationNumber, seatNumber);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.put('/api/:reservationNumber/cancel', async (req, res) => {
    try {
        const reservationNumber = req.params.reservationNumber;
        const updated = await updateStatus(reservationNumber, 'Cancelled');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/api/:flightNumber/:selectedSeat', async (req, res) => {
    try {
        const flightNumber = req.params.flightNumber;
        const selectedSeat = req.params.selectedSeat;

        const seatMap = await getSeatMap(flightNumber);
        const modifiedSeatMap = seatMap.map(row =>
            row.map(seat => {
                if (seat.number == selectedSeat) {
                    return { ...seat, occupied: false, selected: true };
                } else {
                    return { ...seat, selected: false };
                }
            })
        );

        res.render('seatsModal', {
            layout: false,
            seats: modifiedSeatMap
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/reservations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await getReservations(page, limit, "TESTUSER");
        const totalPages = Math.ceil(totalReservations / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/reservations?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalReservations,
            resultsPerPage: limit,
            baseUrl: '/reservations?page='
        };

        res.status(200).render('reservations', {
            page: '/reservations',
            script: '/scripts/user/reservations.js',
            role: userRole,
            reservationCards: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/admin/reservations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { reservations, totalReservations } = await getReservations(page, limit);
        const totalPages = Math.ceil(totalReservations / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/admin/reservations?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalReservations,
            resultsPerPage: limit,
            baseUrl: '/admin/reservations?page='
        };

        res.status(200).render('admin-reservations', {
            page: '/admin/reservations',
            script: '/scripts/admin/admin-flights.js',
            role: userRole,
            reservationRows: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.post("/register", async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.redirect("/login");

    } catch (error) {
        console.error(error);
        res.status(500).send("Registration Failed.");
    }
});

server.get('/login', (req, res) => {
    res.render('login', { message: "user login page"});
});

server.post("/login", async (req, res) => {
    try {
        const email = req.body.emailAddress;
        const password = req.body.password;
        const user = await Users.findOne({
            emailAddress: email
        });

        if (!user) {
            return res.send("User not found.");
        }

        if (user.password !== password) {
            return res.send("Incorrect password.");
        }

        req.session.user = {
        _id: user._id,
        emailAddress: user.emailAddress,
        role: user.role
        };

        if (user.role === "admin") {
            return res.redirect("/admin-profile");
        }
        res.redirect("/user-profile");

    } catch (err) {
        console.log(err);
        res.status(500).send("Login failed.");
    }
});

server.put("/api/users/change-password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await changePassword(
            req.session.user._id,
            currentPassword,
            newPassword
        );
        res.json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

server.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

server.put("/api/profile", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Not logged in."
            });
        }

        const user = await updateUser(
            req.session.user._id,
            req.body
        );

        req.session.user.emailAddress = user.emailAddress;
        
        res.json({
            success: true,
            user
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Unable to update profile."
        });
    }
});

server.get("/user-profile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const user = await getUserById(req.session.user._id);
    res.render("user", {
        user
    });
});

server.get("/admin-profile", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/login");
    }

    const user = await getUserById(req.session.user._id);

    res.render("admin", {
        user
    });
});

server.get("/user/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", {
        user
    });
});

server.get("/admin-users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.render("admin-users", {
            users,
            layout: "main"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Unable to load users.");
    }
});

server.get("/api/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

server.get("/api/users/:id", async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        res.json(user);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

server.put("/api/users/:id", async (req, res) => {
    try {
        const updatedUser = await updateUser(req.params.id, req.body);
        res.json({
            success: true,
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

server.get('/flight-book', (req, res) => {
    res.render('booking', {
        page: '/flight-book',
        script: '/scripts/user/booking.js'
    });
});

server.get('/api/search', async (req, res) => {
  const { originAirport, destinationAirport, date } = req.query;
  
  // Construct dynamic query
  let query = {};
  if (originAirport) query.originAirport = originAirport;
  if (destinationAirport) query.destinationAirport = destinationAirport;
  if (date) {
    // Match the exact day in MongoDB regardless of time
    const start = new Date(date);
    start.setUTCHours(0,0,0,0);
    const end = new Date(date);
    end.setUTCHours(23,59,59,999);
    query.date = { $gte: start, $lte: end };
  }

  try {
    const results = await Record.find(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.post('/flight-book', (req, res) => {
    // if user has not picked flight and goes to this link,
    // redirect to flight-search

    try {
        const reservation = createReservation(req.body);
        res.status(200).json({ success: true, reservation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed To Create Reservation!' });
    }
});

server.get('/reservations', (req, res) => {
    res.render('reservations', {
        page: '/reservations',
        script: '/scripts/user/reservations.js'
    });
});

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});