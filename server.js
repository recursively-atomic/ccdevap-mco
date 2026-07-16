const Users = require('./private/models/users');
const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { createUser, getUserById, getUserByEmail, getAllUsers, updateUser, changePassword } = require('./private/controllers/users');
const server = express();

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

server.use("/", reservationRoutes);
server.use("/api/flights", flightRoutes);

server.get('/', (req, res) => {
    if (!req.session.user) {
        res.render('index', {
            page: '/',
            script: '/scripts/index.js',
            role: req.session.user
        });
    } else {
        res.redirect('/register');
    }
});

server.get("/register", (req, res) => {
    res.render('register', { message: "user registration page" });
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
        user: user
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

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});