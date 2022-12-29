const mongoose = require('mongoose');
const { generateSessionId } = require('../../helpers/sessionId');
const bcrypt = require('bcryptjs');
const { PatientDetails } = require('./PatientDetails.model');
const Exception = require('../../error/Exception');
const PatientMedical = require('./PatientMedical.model');

const PatientLoginSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    let number = v.replaceAll(/\D/g, '');
                    return /^([9]\d{9})$/.test(number);
                },
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
        sessionId: {
            type: String,
            required: false,
            select: false,
            default: null,
        },
        otp: {
            type: new mongoose.Schema({
                number: {
                    type: String,
                    required: true,
                },
                expiry: {
                    type: Date,
                    required: true,
                },
            }),
            select: false,
        },
        accountCompleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        smsAlerts: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware to hash the password before saving
 */
PatientLoginSchema.pre('save', async function (next) {
    const patient = this;
    if (!patient.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(patient.password, salt);

    patient.password = hashed;

    next();
});

PatientLoginSchema.methods.toJSON = function () {
    const patient = this;
    const patientObject = patient.toObject();

    delete patientObject.password;
    delete patientObject.sessionId;
    delete patientObject.otp;
    delete patientObject.__v;
    delete patientObject._id;
    delete patientObject.createdAt;
    delete patientObject.updatedAt;

    return patientObject;
};

/**
 * Compares password with the hashed password
 * @param {string} candidatePassword
 * @returns boolean
 */
PatientLoginSchema.methods.comparePassword = async function (
    candidatePassword
) {
    const patient = await PatientLogin.findOne({
        mobileNumber: this.mobileNumber,
    }).select('password');

    const isMatch = await bcrypt.compare(candidatePassword, patient.password);
    return isMatch;
};

PatientLoginSchema.methods.generateSessionId = async function () {
    const patient = await PatientLogin.findOne({
        mobileNumber: this.mobileNumber,
    }).select('sessionId');

    const sid = generateSessionId('30d');
    patient.sessionId = sid;
    patient.save();

    return sid;
};

PatientLoginSchema.methods.compareSession = async function (sessionId) {
    const patient = await PatientLogin.findById(this._id).select('sessionId');
    if (patient.sessionId != sessionId) return false;
    return true;
};

PatientLoginSchema.methods.deleteUser = async function () {
    try {
        const patientLogin = await PatientLogin.findById(this._id);
        if (!patientLogin) throw new Exception('User not found', 404);
        const patientDetails = await PatientDetails.findById(this._id);
        const patientMedical = await PatientMedical.findById(this._id);

        await patientLogin.remove();
        if (patientDetails) await patientDetails.remove();
        if (patientMedical) await patientMedical.remove();
    } catch (error) {
        console.log(error);
        throw new Exception('Problem deleting user', 500);
    }
};

const PatientLogin = mongoose.model('PatientLogin', PatientLoginSchema);

module.exports = PatientLogin;
