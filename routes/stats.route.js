const { getTrendDiseases } = require('../controllers/stats.controller');

const router = require('express').Router();

router.get('/diseases', getTrendDiseases);

module.exports = router;
