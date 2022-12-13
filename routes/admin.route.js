const router = require('express').Router();
const {
    loginAdmin,
    createAdmin,
    logoutAdmin,
    createStaffAccount,
    deleteStaffAccount,
    getAdmin,
    getStaff,
    getStaffs,
    signupAdmin,
    backupDatabase,
    backupPatientsInfo,
    generateClusteredQueueHistory,
    getPatients,
} = require('../controllers/admin.controller');
const { authAdmin } = require('../security/auth/auth');

router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);

router.use(authAdmin);

router.get('/me', getAdmin);
router.get('/staff', getStaffs);
router.get('/patients', getPatients);
router.get('/backup/all', backupDatabase);
router.get('/backup/patients', backupPatientsInfo);
router.post('/new', createAdmin);
router.post('/logout', logoutAdmin);
router.post('/staff/new', createStaffAccount);
router.delete('/staff/delete', deleteStaffAccount);
router.get('/get', getAdmin);

router.get('/staff/get', getStaff);

router.get('/queueHistory', generateClusteredQueueHistory);
module.exports = router;
