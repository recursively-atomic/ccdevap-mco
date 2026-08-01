const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.get('/audits', authenticate, authorize(['admin']), (req, res) => {
    res.render('audits', {
        page: '/audits',
        role: req.session.user.role
    });
});

module.exports = router;