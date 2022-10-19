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
} = require('../controllers/patient.controller');
const { auth } = require('../security/auth/auth');

const router = require('express').Router();

router.post('/login', loginAccount);
router.post('/signup', createAccount);

router.use(auth);

router.get('/l', getPersonalLogin);
router.get('/d', getPersonalDetails);
router.get('/m', getPersonalMedical);
router.get('/c', getPersonalConsultations);

router.post('/logout', logoutAccount);

router.post('/add_details', addAccountDetails);
router.post('/add_medical', addMedical);
router.post('/update_medical', updateMedical);

router.put('/toggleSmsAlerts', toggleSmsAlerts);

module.exports = router;
