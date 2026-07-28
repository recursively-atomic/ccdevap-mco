const express = require('express');
const router = express.Router();

const { getFlights } = require('../controllers/flightController');
const { getReservations } = require('../controllers/reservationController');
const {
    getUser,
    getUserByEmail,
    getLastUserNumber,
    getUsers,
    createUser,
    updateUser,
    updatePassword
} = require('../controllers/userController');

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role == 'user') {
        return res.redirect('/home');
    } else if (req.session.user.role == 'admin') {
        return res.redirect('/dashboard');
    }
});

router.get('/home', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    req.session.user.selectedFlight = null;
    const { reservations } = await getReservations(0, 0, parseInt(req.session.user.number));
    const activeReservations = reservations.filter(reservation => reservation.status !== 'Cancelled').length;
    const { flights } = await getFlights(0, 0);
    const activeFlights = flights.filter(flight => flight.status !== 'Cancelled').length;

    res.status(200).render('home', {
        page: '/home',
        script: '/scripts/home.js',
        role: req.session.user.role,
        reservations: activeReservations,
        flights: activeFlights
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
            number: user.userNumber,
            emailAddress: user.emailAddress,
            role: user.role,
            selectedFlight: null
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

    req.session.user.selectedFlight = null;

    try {
        const user = await getUser(parseInt(req.session.user.number));

        res.status(200).render('profile', {
            page: '/profile',
            script: '/scripts/profile.js',
            role: req.session.user.role,
            user: user
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'admin') {
        return res.redirect('/');
    }

    try {
        const user = await getUser(parseInt(req.session.user.number));

        res.render('dashboard', {
            page: '/dashboard',
            script: '/scripts/dashboard.js',
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
        let page = parseInt(req.query.page) || 1, limit = 10;
        const { users, totalUsers } = await getUsers();
        const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

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
            script: '/scripts/users.js',
            role: req.session.user.role,
            currentUser: req.session.user.number,
            userRows: users,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// APIs
router.get('/api/read-user-number', async (req, res) => {
    try {
        const user = await getUser(req.session.user.number);
        res.status(200).json({ success: true, userNumber: user.number });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-user-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.session.user.role != 'user') {
        return res.redirect('/dashboard');
    }

    try {
        const { currentPassword, newPassword } = req.body;
        const userData = {
            userNumber: req.session.user.number,
            currentPassword,
            newPassword
        }

        await updatePassword(userData);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-user-profile', async (req, res) => {
    try {
        const userData = {
            userNumber: req.session.user.number,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            contactNumber: req.body.contactNumber
        }

        const updatedUser = await updateUser(userData);
        req.session.user.emailAddress = updatedUser.emailAddress;

        res.status(200).json({ success: true, user: updatedUser });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;