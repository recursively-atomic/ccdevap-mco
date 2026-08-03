const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const { readAudits } = require('../controllers/auditController');

router.get('/audits', authenticate, authorize(['admin']), async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1, limit = 10;
        const { audits, totalAudits } = await readAudits(page, limit);
        const totalPages = Math.max(1, Math.ceil(totalAudits / limit));

        let pagination;

        if (!req.query.page && totalPages > 1) {
            return res.redirect('/audits?page=1');
        }

        pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalAudits,
            resultsPerPage: limit,
            baseUrl: '/audits?page='
        };

        res.status(200).render('audits', {
            page: '/audits',
            role: req.session.user.role,
            currentUser: req.session.user.number,
            auditRows: audits,
            pagination: pagination
        });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;