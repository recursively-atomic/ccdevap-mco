const express = require('express');
const router = express.Router();

const { getUserById, getUserByEmail, getLastUserNumber, getUsers, createUser, updateUser, updatePassword } = require('../controllers/userController');

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role == 'user') {
        return res.redirect('/home');
    } else if (req.session.user.role == 'admin') {
        return res.redirect('/dashboard');
    }
});

router.get('/home', (req, res) => {
    res.status(200).render('home', {
        page: '/home',
        script: '/scripts/home.js',
        role: req.session.user.role,
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        script: '/scripts/register.js',
    });
});

router.post('/register', async (req, res) => {
    try {
        if (await getUserByEmail(req.body['email-address'])) {
            return res.status(409).json({ success: false });
        }

        const lastUserNumber = await getLastUserNumber();
        const newUserNumber = lastUserNumber ? lastUserNumber.userNumber + 1 : 1;
        const userData = {
            userNumber: newUserNumber,
            emailAddress: req.body['email-address'],
            password: req.body['password'],
            firstName: req.body['first-name'],
            lastName: req.body['last-name']
        };

        await createUser(userData);
        res.status(200).json({ success: true, redirect: '/login', user: userData });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/login', (req, res) => {
    res.render('login', {
        script: '/scripts/login.js',
    });
});

router.post('/login', async (req, res) => {
    try {
        const email = req.body['email-address'];
        const password = req.body['password'];
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false });
        }

        req.session.user = {
            _id: user._id,
            emailAddress: user.emailAddress,
            role: user.role
        };

        if (user.role == 'admin') {
            return res.redirect('/dashboard');
        } else if (user.role == 'user') {

        }

        res.redirect('/profile');
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    const user = await getUserById(req.session.user._id);

    res.status(200).render('profile', {
        page: '/profile',
        script: '/scripts/user/profile.js',
        role: req.session.user.role,
        user: user
    });
});

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'admin') {
        return res.redirect('/');
    }

    try {
        const user = await getUserById(req.session.user._id);

        res.render('dashboard', {
            page: '/dashboard',
            script: '/scripts/admin/dashboard.js',
            role: req.session.user.role,
            user: user
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/users', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'admin') {
        return res.redirect('/home');
    }

    try {
        const page = parseInt(req.query.page) || 1, limit = 10;
        const { users, totalUsers } = await getUsers();
        const totalPages = Math.ceil(totalUsers / limit);

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/users?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalUsers,
            resultsPerPage: limit,
            baseUrl: '/users?page='
        };

        res.status(200).render('users', {
            page: '/users',
            script: '/scripts/admin/users.js',
            role: req.session.user.role,
            userRows: users,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/user/:id', async (req, res) => {
    const user = await getUserById(req.params.id);

    res.render('profile', {
        user: user
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// APIs

router.get('/api/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.put('/api/users/change-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    try {
        const { currentPassword, newPassword } = req.body;
        await updatePassword(req.session.user._id, currentPassword, newPassword);

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

router.put('/api/profile', async (req, res) => {
    try {
        const user = await updateUser(
            req.session.user._id,
            req.body
        );

        req.session.user.emailAddress = user.emailAddress;
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Unable to update profile.'
        });
    }
});

router.get('/api/users/:id', async (req, res) => {
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

router.put('/api/users/:id', async (req, res) => {
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