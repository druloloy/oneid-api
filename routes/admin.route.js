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
    updateStaffAccount,
    getPatient,
    updatePatient,
    deletePatient,
    createSchedule,
    updateActivities,
    updateTime,
    getSchedules,
    getActivities,
    removeSchedule,
    updatePassword,
} = require('../controllers/admin.controller');
const { authAdmin } = require('../security/auth/auth');

router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);

// schedules
router.get('/schedule', getSchedules);
router.get('/schedule/activities', getActivities);

router.use(authAdmin);

router.get('/me', getAdmin);
router.get('/staff', getStaffs);
router.get('/patient', getPatient);
router.get('/patients', getPatients);
router.put('/patient/update', updatePatient);
router.delete('/patient/delete', deletePatient);
router.get('/backup/all', backupDatabase);
router.get('/backup/patients', backupPatientsInfo);
router.post('/new', createAdmin);
router.post('/logout', logoutAdmin);
router.post('/staff/new', createStaffAccount);
router.put('/staff/update', updateStaffAccount);
router.delete('/staff/delete', deleteStaffAccount);
router.get('/get', getAdmin);

router.get('/staff/get', getStaff);

// schedules
router.post('/schedule', createSchedule);
router.put('/schedule/activities', updateActivities);
router.put('/schedule/time', updateTime);
router.delete('/schedule', removeSchedule);

// password
router.put('/password', updatePassword);

// queue history
router.get('/queueHistory', generateClusteredQueueHistory);
module.exports = router;
