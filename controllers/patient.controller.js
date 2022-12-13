const PatientLogin = require('../models/patient/PatientLogin.model');
const { PatientDetails } = require('../models/patient/PatientDetails.model');
const Exception = require('../error/Exception');
const aes = require('../security/aes/aes');
const PatientMedical = require('../models/patient/PatientMedical.model');
const PatientConsultation = require('../models/patient/PatientConsultation.model');
const StaffLogin = require('../models/staff/StaffLogin.model');
const StaffDetails = require('../models/staff/StaffDetails.model');
const GenOneId = require('../helpers/GenOneId');
const titleCaser = require('../helpers/titleCaser');
const QueueHistory = require('../models/patient/QueueHistory.model');

exports.getPersonalLogin = async (req, res, next) => {
    try {
        const patient = req.user;

        res.status(200).json({
            success: true,
            id: patient._id,
            content: patient.toJSON(),
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPersonalDetails = async (req, res, next) => {
    try {
        const patient = req.user;
        const patientDetails = await PatientDetails.findOne({
            _id: patient._id,
        });

        res.status(200).json({
            success: true,
            id: patient._id,
            content: patientDetails?.toJSON() ?? null,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPersonalMedical = async (req, res, next) => {
    try {
        const patient = req.user;
        const patientMedical = await PatientMedical.findOne({
            _id: patient._id,
        });

        res.status(200).json({
            success: true,
            id: patient._id,
            content: patientMedical?.toJSON() ?? null,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getPersonalConsultations = async (req, res, next) => {
    try {
        const patient = req.user;
        const patientConsultation = await PatientConsultation.find({
            patientId: patient._id,
        });

        res.status(200).json({
            success: true,
            id: patient._id,
            content: patientConsultation ?? null,
        });
    } catch (error) {
        return next(error);
    }
};

exports.createAccount = async (req, res, next) => {
    try {
        const { mobileNumber, password } = req.body;

        if (!mobileNumber || !password)
            return next(
                new Exception('Mobile number or password is missing.', 400)
            );

        const patientLogin = new PatientLogin({
            mobileNumber,
            password,
        });

        await patientLogin.save();

        const sid = await patientLogin.generateSessionId();

        // pass session id and user id

        const userId = patientLogin._id.toHexString();
        res.cookie('_sid', sid);
        res.cookie('_uid', aes.encrypt(userId));

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            content: patientLogin,
        });
    } catch (error) {
        return next(error);
    }
};
exports.addAccountDetails = async (req, res, next) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            suffix,
            birthdate,
            address,
            sex,
        } = req.body;

        const patient = req.user;

        if (await PatientDetails.findById(patient._id))
            return next(new Exception('Account details already exists', 400));

        const patientDetails = new PatientDetails({
            _id: patient,
            firstName: titleCaser(firstName),
            middleName: middleName ? titleCaser(middleName) : '',
            lastName: titleCaser(lastName),
            suffix: suffix ? titleCaser(suffix) : '',
            birthdate,
            address,
            sex,
        });

        await patientDetails.save();
        await patient.save();

        res.status(201).json({
            success: true,
            message: 'Account details added successfully',
            content: patientDetails,
        });
    } catch (error) {
        return next(error);
    }
};

exports.loginAccount = async (req, res, next) => {
    try {
        const { mobileNumber, password } = req.body;

        if (!mobileNumber || !password)
            return next(
                new Exception('Mobile number or password is missing.', 400)
            );

        const patientLogin = await PatientLogin.findOne({ mobileNumber });

        if (!patientLogin)
            return next(
                new Exception('Mobile number or password is incorrect.', 400)
            );

        const isMatch = await patientLogin.comparePassword(password);

        if (!isMatch)
            return next(
                new Exception('Mobile number or password is incorrect.', 400)
            );

        const sid = await patientLogin.generateSessionId();

        // pass session id and user id

        const userId = patientLogin._id.toHexString();
        res.cookie('_sid', sid);
        res.cookie('_uid', aes.encrypt(userId));

        res.status(200).json({
            success: true,
            message: 'Login successful',
            content: patientLogin,
        });
    } catch (error) {
        return next(error);
    }
};

exports.addMedical = async (req, res, next) => {
    try {
        const { height, weight, bloodGroup, bloodPressure, allergies } =
            req.body;

        const patient = req.user;
        const patientMedical = new PatientMedical({
            _id: patient,
            height,
            weight,
            bloodGroup,
            bloodPressure,
            allergies,
        });
        await patientMedical.save();
        patient.accountCompleted = true;
        await patient.save();
        res.status(201).json({
            success: true,
            message: 'Medical details added successfully',
        });
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

exports.logoutAccount = async (req, res, next) => {
    try {
        const patient = req.user;

        patient.sessionId = null; // clear sessionId
        await patient.save();

        res.clearCookie('_sid');
        res.clearCookie('_uid');

        res.status(200).json({
            success: true,
            message: 'User logged out!',
        });
    } catch (error) {
        return next(error);
    }
};

exports.updateMedical = async (req, res, next) => {
    try {
        const { p } = req.query;
        const patient = req.user;
        const patientMedical = await PatientMedical.findById(patient._id);

        if (p) {
            switch (p) {
                case 'bloodPressure': {
                    const { m } = req.query;

                    if (m === 'add') {
                        const { sys, dia } = req.body;
                        if (!sys || !dia)
                            return next(
                                new Exception('Missing parameters', 400)
                            );

                        patientMedical.addBloodPressure(sys, dia);
                    }
                    if (m === 'remove') {
                        patientMedical.removeRecentBloodPressure();
                    }
                    break;
                }
                case 'allergies': {
                    const { m } = req.query;
                    const { allergy } = req.body;
                    if (m === 'add') {
                        if (!allergy)
                            return next(
                                new Exception('Missing parameters', 400)
                            );

                        patientMedical.addAllergy(allergy);
                    }
                    if (m === 'remove') {
                        patientMedical.removeAllergy(allergy);
                    }
                    break;
                }
                default: {
                    return next(new Exception('Invalid parameter', 400));
                }
            }
        } else {
            const { height, weight, bloodGroup } = req.body;
            patientMedical.height = height;
            patientMedical.weight = weight;
            patientMedical.bloodGroup = bloodGroup;
            patientMedical.save();
        }

        res.status(200).json({
            success: true,
            message: 'Medical details updated successfully',
        });
    } catch (error) {
        return next(error);
    }
};

exports.toggleSmsAlerts = async (req, res, next) => {
    try {
        const patient = req.user;
        patient.smsAlerts = !patient.smsAlerts;
        await patient.save();

        res.status(200).json({
            success: true,
            message: 'SMS alerts toggled successfully',
        });
    } catch (error) {
        return next(error);
    }
};

exports.generateId = async (req, res, next) => {
    try {
        const patient = req.user;
        const patientDetails = await PatientDetails.findById(patient._id);

        if (!patientDetails)
            return next(new Exception('Patient details not found', 404));

        const image = await GenOneId(patient._uid, {
            firstName: patientDetails.firstName,
            lastName: patientDetails.lastName,
            suffix: patientDetails.suffix,
        });
        res.status(200).json({
            success: true,
            content: image,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getVisits = async (req, res, next) => {
    try {
        const patient = req.user;
        const history = await QueueHistory.find({
            'patient._id': patient._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            content: history,
        });
    } catch (error) {
        return next(error);
    }
};

exports.getNextSchedules = async (req, res, next) => {
    try {
        const patient = req.user;

        const schedules = await PatientConsultation.find({
            patientId: patient._id,
            nextConsultation: { $gt: new Date() },
        }).sort({ nextConsultation: -1 });

        res.status(200).json({
            success: true,
            content: schedules,
        });
    } catch (error) {
        return next(error);
    }
};
