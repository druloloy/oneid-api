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
} = require('../controllers/admin.controller');
const { authAdmin } = require('../security/auth/auth');

router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);
router.get('/staff', getStaffs);
router.get('/backup/all', backupDatabase);
router.get('/backup/patients', backupPatientsInfo);
router.use(authAdmin);

router.post('/new', createAdmin);
router.post('/logout', logoutAdmin);
router.post('/staff/new', createStaffAccount);
router.delete('/staff/delete', deleteStaffAccount);
router.get('/get', getAdmin);

router.get('/staff/get', getStaff);

module.exports = router;
