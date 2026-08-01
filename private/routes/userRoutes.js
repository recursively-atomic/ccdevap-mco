const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

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

router.get('/', authenticate, (req, res) => {
    if (req.session.user.role == 'user') {
        return res.redirect('/home');
    } else if (req.session.user.role == 'admin') {
        return res.redirect('/dashboard');
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

        if (email && email.includes('@') && password) {
            if (!user) {
                return res.status(404).json({ success: false });
            }

            if (user.password !== password) {
                return res.status(401).json({ success: false });
            }
        } else {
            return res.status(400).json({ success: false });
        }

        req.session.user = {
            number: user.userNumber,
            emailAddress: user.emailAddress,
            role: user.role,
            selectedFlight: null
        };

        if (user.role == 'admin') {
            return res.status(200).json({ success: true, redirect: '/dashboard' });
        } else if (user.role == 'user') {
            return res.status(200).json({ success: true, redirect: '/profile' });
        }
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/home', authenticate, authorize(['user']), async (req, res) => {
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
        const email = req.body['email-address'];
        const password = req.body['password'];
        const firstName = req.body['first-name'];
        const lastName = req.body['last-name'];
        const passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/;
        const emailRequirements = /[^@\s]+@[^@\s]+\.[^@\s]{2,}/;

        if (!email || !password || !firstName || !lastName || !emailRequirements.test(email) || !passwordRequirements.test(password)) {
            return res.status(400).json({ success: false });
        }

        if (await getUserByEmail(email)) {
            return res.status(409).json({ success: false });
        }

        const lastUserNumber = await getLastUserNumber();
        const newUserNumber = lastUserNumber ? lastUserNumber.userNumber + 1 : 1;
        const userData = {
            userNumber: newUserNumber,
            emailAddress: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        await createUser(userData);
        res.status(200).json({ success: true, redirect: '/login', user: userData });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/profile', authenticate, authorize(['user']), async (req, res) => {
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

router.get('/dashboard', authenticate, authorize(['admin']), async (req, res) => {
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

router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
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
        const user = await getUser(parseInt(req.session.user.number));
        res.status(200).json({ success: true, userNumber: user.number });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-user-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/;
        const user = await getUser(parseInt(req.session.user.number));

        if (!currentPassword || !newPassword || !passwordRequirements.test(newPassword) || (user.password !== currentPassword)) {
            if ((user.password !== currentPassword) && currentPassword) {
                return res.status(422).json({ success: false });
            } else {
                return res.status(400).json({ success: false });
            }
        }

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
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const emailAddress = req.body.emailAddress;

        if (!firstName || !lastName || !emailAddress) {
            return res.status(400).json({ success: false });
        }

        const userData = {
            userNumber: req.session.user.number,
            firstName: firstName,
            lastName: lastName,
            emailAddress: emailAddress,
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