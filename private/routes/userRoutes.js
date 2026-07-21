const express = require('express');
const router = express.Router();

const model = require('../models/userModel');
const { getUserById, getUserByEmail, getUsers, createUser, updateUser, updatePassword } = require('../controllers/userController');

router.get('/', (req, res) => {
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
    res.render('login', { message: "user login page" });
});

router.post("/login", async (req, res) => {
    try {
        const email = req.body.emailAddress;
        const password = req.body.password;
        const user = await model.findOne({
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

router.get("/user-profile", async (req, res) => {
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

router.get('/admin-profile', async (req, res) => {
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

router.get("/user/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", {
        user
    });
});

router.get("/admin-users", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else if (req.session.user.role != "admin") {
        return res.redirect("/");
    }

    try {
        const users = await getUsers();
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