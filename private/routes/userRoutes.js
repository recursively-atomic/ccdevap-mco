const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const { createAudit } = require('../controllers/auditController');
const { readFlights } = require('../controllers/flightController');
const { readReservations } = require('../controllers/reservationController');
const {
    createUser,
    readUser,
    readUserByEmail,
    readLastUserNumber,
    readUsers,
    updateUser,
    updatePassword
} = require('../controllers/userController');

router.get('/', authenticate, (req, res) => {
    if (req.session.user.role === 'user') {
        return res.redirect('/home');
    } else if (req.session.user.role === 'admin') {
        return res.redirect('/dashboard');
    }
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

        if (!email || !password || !firstName || !lastName || !emailRequirements.test(email) || (password.length < 8) || !passwordRequirements.test(password)) {
            return res.status(400).json({ success: false });
        }

        if (await readUserByEmail(email)) {
            return res.status(409).json({ success: false });
        }

        const lastUserNumber = await readLastUserNumber();
        const newUserNumber = lastUserNumber ? lastUserNumber.userNumber + 1 : 1;
        const userData = {
            userNumber: newUserNumber,
            emailAddress: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        const user = await createUser(userData);
        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.emailAddress,
            userRole: user.role,
            action: 'u-reg'
        };

        await createAudit(auditData);
        res.status(200).json({ success: true, redirect: '/login', user: userData });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/login', (req, res) => {
    if(req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/dashboard');
        }
        return res.redirect('/home');
    }
    res.render('login', {
        script: '/scripts/login.js',
    });
});

router.post('/login', async (req, res) => {
    try {
        const email = req.body['email-address'];
        const password = req.body['password'];
        const user = await readUserByEmail(email);
        const emailRequirements = /[^@\s]+@[^@\s]+\.[^@\s]{2,}/;

        if (email && emailRequirements.test(email) && password) {
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

        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.emailAddress,
            userRole: user.role,
            action: 'u-lin'
        };

        await createAudit(auditData);

        if (user.role === 'admin') {
            return res.status(200).json({ success: true, redirect: '/dashboard' });
        } else if (user.role === 'user') {
            return res.status(200).json({ success: true, redirect: '/profile' });
        }
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get('/home', authenticate, authorize(['user']), async (req, res) => {
    req.session.user.selectedFlight = null;
    const { reservations } = await readReservations(0, 0, req.session.user.number);
    const activeReservations = reservations.filter(reservation => reservation.status !== 'Cancelled' && reservation.status !== 'Completed').length;
    const { flights } = await readFlights(0, 0);
    const activeFlights = flights.filter(flight => flight.status !== 'Cancelled' && flight.status !== 'Completed').length;

    res.status(200).render('home', {
        page: '/home',
        script: '/scripts/home.js',
        role: req.session.user.role,
        reservations: activeReservations,
        flights: activeFlights
    });
});

router.get('/profile', authenticate, authorize(['user']), async (req, res) => {
    req.session.user.selectedFlight = null;

    try {
        const user = await readUser(req.session.user.number);

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

router.get('/logout', authenticate, authorize(['admin', 'user']), async (req, res) => {
    try {
        const user = await readUser(req.session.user.number);
        const auditData = {
            userNumber: user.userNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.emailAddress,
            userRole: user.role,
            action: 'u-lot'
        };

        await createAudit(auditData);
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } catch (error) {
        console.error(error);

        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
});

router.get('/dashboard', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const user = await readUser(req.session.user.number);

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
        const { users, totalUsers } = await readUsers();
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

// APIs
router.get('/api/read-user-number', authenticate, authorize(['user']), async (req, res) => {
    try {
        const user = await readUser(req.session.user.number);
        res.status(200).json({ success: true, userNumber: user.userNumber });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-user-profile', authenticate, authorize(['user']), async (req, res) => {
    try {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const emailAddress = req.body.emailAddress;
        const emailRequirements = /[^@\s]+@[^@\s]+\.[^@\s]{2,}/;

        if (!firstName || !lastName || !emailAddress || !emailRequirements.test(emailAddress)) {
            return res.status(400).json({ success: false });
        }

        const userData = {
            userNumber: req.session.user.number,
            firstName: firstName,
            lastName: lastName,
            emailAddress: emailAddress,
            contactNumber: req.body.contactNumber
        }

        const oldUser = await readUser(req.session.user.number);
        const updatedUser = await updateUser(userData);
        req.session.user.emailAddress = updatedUser.emailAddress;
        const auditData = {
            userNumber: updatedUser.userNumber,
            userName: `${oldUser.firstName} ${oldUser.lastName}`,
            newUserName: `${updatedUser.firstName} ${updatedUser.lastName}`,
            userEmail: updatedUser.emailAddress,
            userRole: updatedUser.role,
            action: 'u-upd'
        };

        await createAudit(auditData);
        res.status(200).json({ success: true, user: updatedUser });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put('/api/update-user-password', authenticate, authorize(['user']), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/;
        const user = await readUser(req.session.user.number);

        if (!currentPassword || !newPassword || !passwordRequirements.test(newPassword) || (newPassword.length < 8) || (user.password !== currentPassword)) {
            if ((user.password !== currentPassword) && currentPassword) {
                return res.status(422).json({ success: false });
            } else {
                return res.status(400).json({ success: false });
            }
        }

        const userData = {
            userNumber: req.session.user.number,
            currentPassword: currentPassword,
            newPassword: newPassword
        }

        await updatePassword(userData);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;