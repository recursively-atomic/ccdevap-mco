require('dotenv').config();

const Users = require('./private/models/users');
const express = require('express');
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
    deleteUser,
    changePassword
} = require('./private/controllers/users');

const {
    createPassenger,
    getPassengersByUser,
    getPassenger,
    updatePassenger,
    deletePassenger
} = require("./private/controllers/passengers");

const {
    createPayment,
    getPaymentByUser,
    updatePayment
} = require("./private/controllers/payments");

const {
    getPreferences,
    savePreferences
} = require("./private/controllers/notificationPreferences");

const {
    getSeatMap,
    createReservation,
    getReservationsByEmail,
    getReservationById
} = require("./private/controllers/reservations");

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
        eq: (a, b) => a == b
    }
});

server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public'))); // Exposes every file in the public folder

server.get('/', (req, res) => {
    res.render('index', {
        page: '/',
        script: '/scripts/index.js'
    });
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

server.get("/api/passengers", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false
            });
        }

        const passengers = await getPassengersByUser(req.session.user._id);

        res.json({
            success: true,
            passengers
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false
        });
    }
});

server.post("/api/passengers", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please log in first."
            });
        }

        const passenger = await createPassenger({

            userId: req.session.user._id,

            countryCode: req.body.countryCode,
            passportCode: req.body.passportCode,
            passportExpiration: req.body.passportExpiration,

            firstName: req.body.firstName,
            lastName: req.body.lastName,
            suffix: req.body.suffix,

            birthDate: req.body.birthDate,
            gender: req.body.gender,
            nationality: req.body.nationality,

            emailAddress: req.body.emailAddress,
            phoneNumber: req.body.phoneNumber

        });

        res.json({
            success: true,
            passenger
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Unable to save passenger."
        });
    }
});

server.delete("/api/passengers/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please log in first."
            });
        }

        const passenger = await getPassenger(req.params.id);
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: "Passenger not found."
            });
        }

        // Prevent users from deleting someone else's passenger
        if (passenger.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        await deletePassenger(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Unable to delete passenger."
        });
    }
});

server.get("/api/passengers/:id", async (req, res) => {
    try {
        const passenger = await getPassenger(req.params.id);

        if (!passenger) {
            return res.status(404).json({
                success: false
            });
        }

        if (passenger.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false
            });
        }

        res.json({
            success: true,
            passenger
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false
        });
    }
});

server.put("/api/passengers/:id", async (req, res) => {
    try {
        const passenger = await getPassenger(req.params.id);

        if (!passenger) {
            return res.status(404).json({ success: false });
        }

        if (passenger.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({ success: false });
        }

        const updated = await updatePassenger(req.params.id, req.body);
        res.json({
            success: true,
            passenger: updated
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false
        });
    }
});

server.get("/api/payment", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false
            });
        }

        const payment = await getPaymentByUser(req.session.user._id);

        res.json({
            success: true,
            payment
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false
        });
    }
});

server.post("/api/payment", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false
            });
        }

        const payment = await createPayment({
            userId: req.session.user._id,
            ...req.body
        });

        res.json({
            success: true,
            payment
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false
        });
    }
});

server.put("/api/payment", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false
            });
        }

        const payment = await getPaymentByUser(req.session.user._id);
        
        if (!payment) {
            return res.status(404).json({
                success: false
            });
        }

        const updated = await updatePayment(
            payment._id,
            req.body
        );

        res.json({
            success: true,
            payment: updated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false
        });
    }
});

server.get("/notification-preferences", async (req, res) => {
    const preferences =
        await getPreferences(req.session.user._id);
    res.json(preferences || {});
});

server.put("/notification-preferences", async (req, res) => {
    const preferences =
        await savePreferences(
            req.session.user._id,
            req.body
        );
    res.json(preferences);
});

server.get("/travel-history", async (req, res) => {
    try {
        const reservations =
            await getReservationsByEmail(
                req.session.user.emailAddress
            );
        res.json(reservations);
    }

    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

server.get("/travel-history/:id", async (req, res) => {
    try {
        const reservation =
            await getReservationById(req.params.id);
        if (!reservation) {
            return res.sendStatus(404);
        }
        res.json(reservation);
    }

    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

server.get("/user-profile", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("user");
});

server.get("/admin-profile", (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/login");
    }
    res.render("admin");
});

server.get("/user/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", {
        user
    });
});

server.put("/api/users/profile", async (req, res) => {
    try {
        const updatedUser = await updateUser(
            req.session.user._id,
            req.body
        );
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

server.get("/admin/users", async (req, res) => {
    const users = await getAllUsers();
    res.render("admin", {
        users
    });
});

server.post("/admin/users/:id/delete", async (req, res) => {
    await deleteUser(req.params.id);
    res.redirect("/admin/users");
});

server.use((req, res) => {
    res.status(404).send("Page not found.");
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