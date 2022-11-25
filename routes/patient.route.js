const { bruteForce } = require('../app');
const {
    createAccount,
    loginAccount,
    addAccountDetails,
    addMedical,
    updateMedical,
    logoutAccount,
    getPersonalDetails,
    getPersonalMedical,
    getPersonalLogin,
    getPersonalConsultations,
    toggleSmsAlerts,
    generateId,
} = require('../controllers/patient.controller');
const { validateSession } = require('../controllers/token.controller');
const { auth } = require('../security/auth/auth');

const router = require('express').Router();

router.post('/login', loginAccount);
router.post('/signup', bruteForce.prevent, createAccount);

router.use(auth);

// token validation
router.post('/verifyToken', validateSession);

router.get('/l', getPersonalLogin);
router.get('/d', getPersonalDetails);
router.get('/m', getPersonalMedical);
router.get('/c', getPersonalConsultations);

router.post('/logout', logoutAccount);

router.post('/add_details', addAccountDetails);
router.post('/add_medical', addMedical);
router.post('/update_medical', bruteForce.prevent, updateMedical);

router.put('/toggleSmsAlerts', bruteForce.prevent, toggleSmsAlerts);

router.post('/genId', generateId);

module.exports = router;
