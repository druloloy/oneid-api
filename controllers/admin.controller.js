const Exception = require('../error/Exception');
const Admin = require('../models/admin/admin.model');
const StaffLogin = require('../models/staff/StaffLogin.model');
const StaffDetails = require('../models/staff/StaffDetails.model');
const aes = require('../security/aes/aes');
const PatientLogin = require('../models/patient/PatientLogin.model');
const { PatientDetails } = require('../models/patient/PatientDetails.model');
const PatientMedical = require('../models/patient/PatientMedical.model');
const PatientConsultation = require('../models/patient/PatientConsultation.model');
const QueueHistory = require('../models/patient/QueueHistory.model');
const json2csv = require('json2csv');
const JSZip = require('jszip');
/** TODO
 * 1. Create database backup
 * 2. Create patient information backup
 */

exports.signupAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return next(new Exception('Username or password is missing.', 400));

        const admin = new Admin({
            username,
            password,
        });

        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            content: admin,
        });
    } catch (error) {
        next(error);
    }
};

exports.loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return next(new Exception('Invalid Credentials.', 400));

        const admin = await Admin.findOne({ username });
        if (!admin) return next(new Exception('Invalid credentials.', 400));

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return next(new Exception('Invalid credentials.', 400));

        const sid = await admin.generateSessionId();

        res.cookie('_sid', sid);
        res.cookie('_uid', aes.encrypt(admin._id.toHexString()));

        res.status(200).json({
            message: 'Login successful',
            content: admin.toJSON(),
        });
    } catch (e) {
        next(e);
    }
};

exports.createAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return next(new Exception('Username or password is missing.', 400));

        const admin = new Admin({
            username,
            password,
        });

        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            content: admin,
        });
    } catch (error) {
        next(error);
    }
};

exports.createStaffAccount = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password)
            return next(new Exception('Username or password is missing.', 400));

        const staffLogin = new StaffLogin({
            username,
            password,
            role,
        });

        await staffLogin.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            content: staffLogin,
        });
    } catch (error) {
        return next(error);
    }
};

exports.deleteStaffAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        let details;
        const login = await StaffLogin.findById(id);
        if (!login) return next(new Exception('Staff not found', 404));

        if (login.accountCompleted) {
            details = await StaffDetails.findById(id);
            await details.remove();
        }

        await staff.remove();

        res.status(200).json({
            message: 'Staff deleted successfully',
        });
    } catch (error) {}
};

exports.logoutAdmin = async (req, res, next) => {
    try {
        const admin = req.user;
        admin.sessionId = null;
        await admin.save();
        res.status(200).json({
            message: 'Successfully logged out',
        });
    } catch (e) {
        next(e);
    }
};
exports.getAdmin = async (req, res, next) => {
    try {
        const admin = req.admin;
        res.status(200).json({
            content: admin.toJson,
        });
    } catch (e) {
        next(e);
    }
};

exports.getStaffs = async (req, res, next) => {
    try {
        // get staff login and details nested
        const staffs = await StaffLogin.find();
        const details = await StaffDetails.find();

        const staffsJson = staffs.map((staff) => staff.toJSON());
        const detailsJson = details.map((detail) => detail.toJSON());

        const staffsDetails = staffsJson.map((staff) => {
            const detail = detailsJson.find(
                (detail) => detail._id.toString() === staff._id.toString()
            );
            return Object.assign(staff, { details: detail });
        });

        res.status(200).json({
            success: true,
            content: staffsDetails,
        });
    } catch (error) {
        next(error);
    }
};

exports.getStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staff = await StaffLogin.findById(id);
        if (!staff) return next(new Exception('Staff not found', 404));

        const details = await StaffDetails.findById(id);
        if (!details) return next(new Exception('Staff not found', 404));

        res.status(200).json({
            content: {
                login: staff.toJSON(),
                details: details.toJson(),
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.backupDatabase = async (req, res, next) => {
    try {
        // fetch all collections
        Promise.all([
            PatientLogin.find(),
            PatientDetails.find(),
            PatientMedical.find(),
            PatientConsultation.find(),
            QueueHistory.find(),
            StaffLogin.find(),
            StaffDetails.find(),
        ]).then((collections) => {
            // destructure collections
            const [
                patientLogins,
                patientDetails,
                patientMedicals,
                patientConsultations,
                queueHistories,
                staffLogins,
                staffDetails,
            ] = collections;

            // create csv
            Promise.all([
                json2csv.parseAsync(
                    patientLogins.map((login) => login.toObject())
                ),
                json2csv.parseAsync(
                    patientDetails.map((detail) => detail.toObject())
                ),
                json2csv.parseAsync(
                    patientMedicals.map((medical) => medical.toObject())
                ),
                json2csv.parseAsync(
                    patientConsultations.map((consultation) =>
                        consultation.toObject()
                    )
                ),
                json2csv.parseAsync(
                    queueHistories.map((history) => history.toObject())
                ),
                json2csv.parseAsync(
                    staffLogins.map((login) => login.toObject())
                ),
                json2csv.parseAsync(
                    staffDetails.map((detail) => detail.toObject())
                ),
            ]).then((csvs) => {
                // destructure csvs
                const [
                    patientLoginsCsv,
                    patientDetailsCsv,
                    patientMedicalsCsv,
                    patientConsultationsCsv,
                    queueHistoriesCsv,
                    staffLoginsCsv,
                    staffDetailsCsv,
                ] = csvs;

                // create zip
                const zip = new JSZip();
                const folder = zip.folder(`backup-${new Date().toISOString()}`);

                // add csvs to zip
                folder.file('patientLogins.csv', patientLoginsCsv);
                folder.file('patientDetails.csv', patientDetailsCsv);
                folder.file('patientMedicals.csv', patientMedicalsCsv);
                folder.file(
                    'patientConsultations.csv',
                    patientConsultationsCsv
                );
                folder.file('queueHistories.csv', queueHistoriesCsv);
                folder.file('staffLogins.csv', staffLoginsCsv);
                folder.file('staffDetails.csv', staffDetailsCsv);

                // send zip
                zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-disposition':
                            'attachment; filename=backup.zip',
                    });
                    res.end(content);
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.backupPatientsInfo = async (req, res, next) => {
    try {
        // fetch all collections
        Promise.all([
            PatientLogin.find(),
            PatientDetails.find(),
            PatientMedical.find(),
            PatientConsultation.find(),
            QueueHistory.find(),
        ]).then((collections) => {
            // destructure collections
            const [
                patientLogins,
                patientDetails,
                patientMedicals,
                patientConsultations,
                queueHistories,
            ] = collections;

            // create csv
            Promise.all([
                json2csv.parseAsync(patientLogins),
                json2csv.parseAsync(patientDetails),
                json2csv.parseAsync(patientMedicals),
                json2csv.parseAsync(patientConsultations),
                json2csv.parseAsync(queueHistories),
            ]).then((csvs) => {
                // destructure csvs
                const [
                    patientLoginsCsv,
                    patientDetailsCsv,
                    patientMedicalsCsv,
                    patientConsultationsCsv,
                    queueHistoriesCsv,
                ] = csvs;

                // create zip
                const zip = new JSZip();
                const folder = zip.folder(
                    `backup_patients_information-${new Date().toISOString()}`
                );

                // add csvs to zip
                folder.file('patientLogins.csv', patientLoginsCsv);
                folder.file('patientDetails.csv', patientDetailsCsv);
                folder.file('patientMedicals.csv', patientMedicalsCsv);
                folder.file(
                    'patientConsultations.csv',
                    patientConsultationsCsv
                );
                folder.file('queueHistories.csv', queueHistoriesCsv);

                // send zip
                zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-disposition':
                            'attachment; filename=backup.zip',
                    });
                    res.end(content);
                });
            });
        });
    } catch (error) {
        next(error);
    }
};
