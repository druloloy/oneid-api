const mongoose = require('mongoose');
const {
    generateSessionId,
    verifySessionId,
} = require('../../helpers/sessionId');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

AdminSchema.pre('save', async function (next) {
    const admin = this;
    if (!admin.isModified('password')) {
        return next();
    }
    admin.password = await bcrypt.hash(admin.password, 8);
    next();
});

AdminSchema.methods.toJSON = function () {
    const admin = this.toObject();
    delete admin.password;
    delete admin.sessionId;
    delete admin.otp;
    return admin;
};

/**
 * Compares password with the hashed password
 * @param {string} candidatePassword
 * @returns boolean
 */
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    const admin = await Admin.findOne({
        username: this.username,
    }).select('password');

    const isMatch = await bcrypt.compare(candidatePassword, admin.password);
    return isMatch;
};

AdminSchema.methods.generateSessionId = async function () {
    const admin = await Admin.findOne({
        username: this.username,
    }).select('sessionId');

    const sid = generateSessionId('12h');
    admin.sessionId = sid;
    admin.save();

    return sid;
};

AdminSchema.methods.compareSession = async function (sessionId) {
    const admin = await Admin.findById(this._id).select('sessionId');
    if (admin.sessionId != sessionId) return false;
    return true;
};
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
