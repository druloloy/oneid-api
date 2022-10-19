const router = require('express').Router();
const { getCsrfToken } = require('../controllers/csrf.controller');

router.options('/', getCsrfToken);

module.exports = router;
