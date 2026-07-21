const express = require('express');
const router = express.Router();

const model = require('../models/userModel');
const { getUserById, getUserByEmail, getUsers, createUser, updateUser, updatePassword } = require('../controllers/userController');

router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.render('home', {
            page: '/home',
            script: '/scripts/index.js',
            role: req.session.user.role,
        });
    }
});

router.get("/register", (req, res) => {
    res.render('register');
});

router.post("/register", async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

router.get('/login', (req, res) => {
    res.render('login', {
        script: '/scripts/login.js',
    });
});

router.post("/login", async (req, res) => {
    try {
        const email = req.body['email-address'];
        const password = req.body['password'];
        const user = await getUserByEmail(email);

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
            return res.redirect('/dashboard');
        }

        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        res.status(500).send("Login failed.");
    }
});

router.put("/api/users/change-password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await updatePassword(
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

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

router.put("/api/profile", async (req, res) => {
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

router.get("/profile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const user = await getUserById(req.session.user._id);
    res.render('profile', {
        page: '/profile',
        script: '/scripts/user/profile.js',
        role: req.session.user.role,
        user: user
    });
});

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/");
    }

    const user = await getUserById(req.session.user._id);

    res.render('dashboard', {
        page: '/dashboard',
        script: '/scripts/admin/dashboard.js',
        role: req.session.user.role,
        user: user
    });
});

router.get("/user/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", {
        user
    });
});

router.get("/users", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/home");
    }

    try {
        const users = await getUsers();

        res.render("users", {
            page: '/users',
            script: '/scripts/admin/users.js',
            role: req.session.user.role,
            users: users
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Unable to load users.");
    }
});

router.get("/api/users", async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get("/api/users/:id", async (req, res) => {
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

router.put("/api/users/:id", async (req, res) => {
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

module.exports = router;