const router = require('express').Router();
const {
    loginStaff,
    logoutStaff,
    addDetails,
    consultPatient,
    getPatientMedical,
    getPatientDetails,
    getPatientLogin,
    getPatientConsultations,
} = require('../controllers/staff.controller');
const { forPhys, authStaff } = require('../security/auth/auth');

router.post('/login', loginStaff);

router.use(authStaff);

router.get('/patient/l', getPatientLogin);
router.get('/patient/d', getPatientDetails);
router.get('/patient/m', getPatientMedical);
router.get('/patient/c', getPatientConsultations);

router.post('/logout', logoutStaff);
router.post('/add_details', addDetails);

router.use(forPhys);
router.post('/consult', consultPatient);

module.exports = router;
