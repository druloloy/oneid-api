const Exception = require('../../error/Exception');
const PatientLogin = require('../../models/patient/PatientLogin.model');
const StaffLogin = require('../../models/staff/StaffLogin.model');
const aes = require('../../security/aes/aes');
const { verifySessionId } = require('../../helpers/sessionId');
const Admin = require('../../models/admin/admin.model');

exports.auth = async (req, res, next) => {
    try {
        const { _sid, _uid } = req.cookies;

        if (!_sid || !_uid)
            return next(new Exception('Please login again.', 401));

        const uid = aes.decrypt(_uid);
        const patient = await PatientLogin.findById(uid);
        if (!patient) return next(new Exception('Please login again.', 401));

        const isValid = verifySessionId(_sid); // checks if session id is expired
        if (!isValid) return next(new Exception('Please login again.', 401));

        const isMatch = await patient.compareSession(_sid);
        if (!isMatch) return next(new Exception('Please login again.', 401));

        req.user = patient;
        req.isAuthenticated = () => req.user !== undefined;
        next();
    } catch (error) {
        return next(new Exception('Auth server error', 500, false));
    }
};

exports.authStaff = async (req, res, next) => {
    try {
        const { _sid, _uid } = req.cookies;

        if (!_sid || !_uid)
            return next(new Exception('Please login again.', 401));

        const uid = aes.decrypt(_uid);
        const staff = await StaffLogin.findById(uid);
        if (!staff) return next(new Exception('Please login again.', 401));

        const isValid = verifySessionId(_sid); // checks if session id is expired
        if (!isValid) return next(new Exception('Please login again.', 401));

        const isMatch = await staff.compareSession(_sid);
        if (!isMatch) return next(new Exception('Please login again.', 401));

        req.user = staff;
        req.isAuthenticated = () => req.user !== undefined;
        next();
    } catch (error) {
        return next(new Exception('Auth server error', 500));
    }
};

exports.forPhys = async (req, res, next) => {
    try {
        const { _r } = req.cookies;
        const role = aes.decrypt(_r);
        if (role !== 'phys')
            return next(new Exception('Unauthorized', 401, true));

        req.role = role;
        next();
    } catch (error) {
        return next(new Exception('Auth server error', 500));
    }
};

exports.authAdmin = async (req, res, next) => {
    try {
        const { _sid, _uid } = req.cookies;

        if (!_sid || !_uid)
            return next(new Exception('Please login again.', 401));

        const uid = aes.decrypt(_uid);
        const admin = await Admin.findById(uid);
        if (!admin) return next(new Exception('Please login again.', 401));

        const isValid = verifySessionId(_sid); // checks if session id is expired
        if (!isValid) return next(new Exception('Please login again.', 401));

        const isMatch = await admin.compareSession(_sid);
        if (!isMatch) return next(new Exception('Please login again.', 401));

        req.user = admin;
        req.isAuthenticated = () => req.user !== undefined;
        next();
    } catch (error) {
        return next(new Exception('Auth server error', 500));
    }
};
