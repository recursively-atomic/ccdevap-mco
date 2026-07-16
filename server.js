const Users = require('./private/models/userModel');
const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const server = express();

const { connectToMongo } = require('./private/connection');
const { createUser, getUserById, getUserByEmail, getAllUsers, updateUser, changePassword } = require('./private/controllers/userController');

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

const reservationRoutes = require('./private/routes/reservationRoutes');
const flightRoutes = require("./private/routes/flightRoutes");

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

server.use("/api", reservationRoutes);
server.use("/api/flights", flightRoutes);

const { getSeatMap, getReservations, createReservation, updateSeat, updateStatus } = require('./private/controllers/reservationController');

server.get('/reservations', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    try {
        const page = parseInt(req.query.page) || 1, limit = 3;
        const { reservations, totalReservations } = await getReservations(page, limit, req.session.user._id);
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
            role: req.session.user.role,
            reservationCards: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/admin-reservations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { reservations, totalReservations } = await getReservations(page, limit);
        const totalPages = Math.ceil(totalReservations / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/admin-reservations?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalReservations,
            resultsPerPage: limit,
            baseUrl: '/admin-reservations?page='
        };

        res.status(200).render('admin-reservations', {
            page: '/admin-reservations',
            script: '/scripts/admin/admin-reservations.js',
            role: req.session.user.role,
            reservationRows: reservations,
            pagination: pagination
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/flight-book', async (req, res) => {
    try {
        if (req.session.user) {
            const seatMap = await getSeatMap("TESTFLIGHT");

            res.status(200).render('booking', {
                page: '/flight-book',
                script: '/scripts/user/booking.js',
                role: req.session.user.role,
                seats: seatMap
            });
        } else {
            res.redirect('/login');
        }
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

server.get('/', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.render('index', {
            page: '/',
            script: '/scripts/index.js',
            role: req.session.user.role,
        });
    }
});

server.get("/register", (req, res) => {
    res.render('register');
});

server.post("/register", async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

server.get('/login', (req, res) => {
    res.render('login', { message: "user login page" });
});

server.post("/login", async (req, res) => {
    try {
        const email = req.body.emailAddress;
        const password = req.body.password;
        const user = await Users.findOne({
            emailAddress: email
        });

        if (!user) {
            return res.send("User Not Found!");
        }

        if (user.password !== password) {
            return res.send("Incorrect Password!");
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
    res.render('user', {
        page: '/user-profile',
        script: '/scripts/user/profile.js',
        role: req.session.user.role,
        user: user
    });
});

server.get('/admin-profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/");
    }

    const user = await getUserById(req.session.user._id);

    res.render('admin', {
        page: '/admin-profile',
        script: '/scripts/admin/admin-dashboard.js',
        role: req.session.user.role,
        user: user
    });
});

server.get("/user/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", {
        user
    });
});

server.get("/admin-users", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/");
    }

    try {
        const users = await getAllUsers();
        res.render("admin-users", {
            page: '/admin-users',
            script: '/scripts/admin/admin-users.js',
            role: req.session.user.role,
            users: users
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

server.get('/flight-search', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render('search', {
        page: '/flight-search',
        script: '/scripts/user/search.js',
        role: req.session.user.role,
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
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    try {
        const results = await Record.find(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

server.get('/flight-search', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render('search', {
        page: '/flight-search',
        script: '/scripts/user/search.js',
        role: req.session.user.role,
    });
});

server.get('/admin-flights', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/");
    }

    res.render('admin-flights', {
        page: '/admin-flights',
        script: '/scripts/admin/admin-flights.js',
        role: req.session.user.role,
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