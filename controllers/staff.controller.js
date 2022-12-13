const StaffLogin = require('../models/staff/StaffLogin.model');
const StaffDetails = require('../models/staff/StaffDetails.model');
const PatientConsultation = require('../models/patient/PatientConsultation.model');
const Exception = require('../error/Exception');
const aes = require('../security/aes/aes');
const { PatientDetails } = require('../models/patient/PatientDetails.model');
const PatientMedical = require('../models/patient/PatientMedical.model');
const PatientLogin = require('../models/patient/PatientLogin.model');

exports.loginStaff = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return next(new Exception('Username or password is missing.', 400));

        const staffLogin = await StaffLogin.findOne({ username });

        if (!staffLogin)
            return next(new Exception('Username or password is missing.', 400));

        const isMatch = staffLogin.comparePassword(password);

        if (!isMatch)
            return next(new Exception('Username or password is missing.', 400));

        const sid = await staffLogin.generateSessionId();

        // pass session id and user id

        const userId = staffLogin._id.toHexString();
        res.cookie('_sid', sid);
        res.cookie('_uid', aes.encrypt(userId));
        res.cookie('_r', aes.encrypt(staffLogin.role), {
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            content: staffLogin,
        });
    } catch (error) {
        return next(error);
    }
};

exports.logoutStaff = async (req, res, next) => {
    try {
        const staff = req.user;

        staff.sessionId = null; // clear sessionId
        await staff.save();

        res.clearCookie('_sid');
        res.clearCookie('_uid');
        res.clearCookie('_r');

        res.status(200).json({
            success: true,
            message: 'User logged out!',
        });
    } catch (error) {
        return next(error);
    }
};

exports.addDetails = async (req, res, next) => {
    try {
        const staff = req.user;
        const {
            firstName,
            middleName,
            lastName,
            suffix,
            birthdate,
            address,
            mobileNumber,
        } = req.body;

        const staffDetails = new StaffDetails({
            _id: staff,
            firstName,
            middleName,
            lastName,
            suffix,
            birthdate,
            address,
            mobileNumber,
        });
        await staffDetails.save();

        staff.accountCompleted = true;
        await staff.save();

        res.status(201).json({
            success: true,
            message: 'Staff details added successfully',
            content: staffDetails,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const staff = req.user;
        const login = await StaffLogin.findById(staff._id);

        res.status(200).json({
            success: true,
            content: login,
        });
    } catch (error) {
        return next(error);
    }
};

exports.consultPatient = async (req, res, next) => {
    try {
        const staff = req.user;
        const { patient_id } = req.query;
        const {
            condition,
            treatments,
            prescriptions,
            remarks,
            nextConsultation,
        } = req.body;

        const staffName = await StaffDetails.findById(staff._id).select(
            'firstName lastName suffix'
        );

        const patientConsultation = new PatientConsultation({
            patientId: patient_id,
            condition,
            treatments,
            prescriptions,
            remarks,
            nextConsultation,
            consultedBy: {
                id: staff,
                name: `${staffName.firstName} ${staffName.lastName} ${staffName.suffix}`,
            },
        });

        console.log(prescriptions);

        await patientConsultation.save();

        res.status(201).json({
            success: true,
            message: 'Patient checked up successfully',
            content: patientConsultation,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPatientLogin = async (req, res, next) => {
    try {
        const { patient_id } = req.query;
        const patient = await PatientLogin.findById(patient_id);

        res.status(200).json({
            success: true,
            id: patient_id,
            content: patient.toJSON(),
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPatientDetails = async (req, res, next) => {
    try {
        const { patient_id } = req.query;
        const patient = await PatientDetails.findById(patient_id);

        res.status(200).json({
            success: true,
            id: patient_id,
            content: patient.toJSON(),
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPatientMedical = async (req, res, next) => {
    try {
        const { patient_id } = req.query;

        const patient = await PatientMedical.findById(patient_id);

        res.status(200).json({
            success: true,
            id: patient_id,
            content: patient.toJSON(),
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPatientConsultations = async (req, res, next) => {
    try {
        const { patient_id } = req.query;
        const patient = await PatientConsultation.find({
            patientId: patient_id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            id: patient_id,
            content: patient,
        });
    } catch (error) {
        return next(error);
    }
};
