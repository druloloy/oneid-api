const mongoose = require('mongoose');
const {
    generateSessionId,
    verifySessionId,
} = require('../../helpers/sessionId');
const bcrypt = require('bcryptjs');

const StaffLoginSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
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
        role: {
            type: String,
            required: true,
            enum: ['phys', 'staff'],
            default: 'staff',
        },
        accountCompleted: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware to hash the password before saving
 */
StaffLoginSchema.pre('save', async function (next) {
    const staff = this;
    if (!staff.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(staff.password, salt);

    staff.password = hashed;

    next();
});

StaffLoginSchema.methods.toJSON = function () {
    const staff = this;
    const staffObject = staff.toObject();

    delete staffObject.password;
    delete staffObject.sessionId;
    delete staffObject.otp;
    delete staffObject.__v;
    delete staffObject._id;
    delete staffObject.createdAt;
    delete staffObject.updatedAt;

    return staffObject;
};

/**
 * Compares password with the hashed password
 * @param {string} candidatePassword
 * @returns boolean
 */
StaffLoginSchema.methods.comparePassword = async function (candidatePassword) {
    const staff = await StaffLogin.findOne({
        username: this.username,
    }).select('password');

    const isMatch = await bcrypt.compare(candidatePassword, staff.password);
    return isMatch;
};

StaffLoginSchema.methods.generateSessionId = async function () {
    const staff = await StaffLogin.findOne({
        username: this.username,
    }).select('sessionId');

    const sid = generateSessionId('12h');
    staff.sessionId = sid;
    staff.save();

    return sid;
};

StaffLoginSchema.methods.compareSession = async function (sessionId) {
    const staff = await StaffLogin.findById(this._id).select('sessionId');
    if (staff.sessionId != sessionId) return false;
    return true;
};

const StaffLogin = mongoose.model('StaffLogin', StaffLoginSchema);
module.exports = StaffLogin;
