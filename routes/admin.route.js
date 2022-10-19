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
} = require('../controllers/admin.controller');
const { authAdmin } = require('../security/auth/auth');
router.post('/login', loginAdmin);

router.use(authAdmin);

router.post('/new', createAdmin);
router.post('/logout', logoutAdmin);
router.post('/staff/new', createStaffAccount);
router.delete('/staff/delete', deleteStaffAccount);
router.get('/get', getAdmin);
router.get('/staff', getStaffs);
router.get('/staff/get', getStaff);

module.exports = router;
