const router = require('express').Router();
const {
    encryptString,
    decryptString,
} = require('../controllers/security.controller');

router.get('/encrypt', encryptString);
router.get('/decrypt', decryptString);

module.exports = router;
