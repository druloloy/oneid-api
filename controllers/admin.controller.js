const Exception = require('../error/Exception');
const Admin = require('../models/admin/admin.model');
const StaffLogin = require('../models/staff/StaffLogin.model');
const StaffDetails = require('../models/staff/StaffDetails.model')
csont Exception = require('../error/Exception');
const aes = require('../security/aes/aes');

exports.loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return next(new Exception('Invalid Credentials.', 400));

        const admin = await Admin.findOne({ username });
        if (!admin)
            return next(new Exception('Invalid credentials.', 400));

        const isMatch = await admin.comparePassword(password);
        if (!isMatch)
            return next(new Exception('Invalid credentials.', 400));

        const sid = await admin.generateSessionId();

        res.cookie('_sid', sid);
        res.cookie('_uid', aes.encrypt(admin._id.toHexString()));
        res.cookie('_r', aes.encrypt(admin.role), { httpOnly: false });

        res.status(200).json({
            message: 'Login successful',
            content: admin.toJSON(),
        });
        

    } catch (e) {
        next(e);
    }
}

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
}

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
        if (!login )
            return next(new Exception('Staff not found', 404));

        if(login.accountCompleted){
            details = await StaffDetails.findById(id);
            await details.remove();
        }
        
        await staff.remove();
        

        res.status(200).json({
            message: 'Staff deleted successfully',
        });
    } catch (error) {
        
    }
}


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
}
exports.getAdmin = async (req, res, next) => {
    try {
        const admin = req.admin;
        res.status(200).json({
            content: admin.toJson,
        });
    } catch (e) {
        next(e);
    }
}

exports.getStaffs = async (req, res, next) => {
    try {
        const staffs = await StaffLogin.find();
        res.status(200).json({
            content: staffs,
        });
    } catch (error) {
        next(error);
    }
}

exports.getStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staff = await StaffLogin.findById(id);
        if (!staff)
            return next(new Exception('Staff not found', 404));
        
        const details = await StaffDetails.findById(id);
        if (!details)
            return next(new Exception('Staff not found', 404));
        
        
        res.status(200).json({
            content: {
                login: staff.toJSON(),
                details: details.toJson(),

            },
        });
    } catch (error) {
        next(error);
    }
}