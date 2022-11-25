const mongoose = require('mongoose');

const StaffDetailsSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'StaffLogin',
    },
    firstName: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]+$/.test(v);
            },
            message: (props) => `${props.value} must contain only alphabets`,
        },
    },
    middleName: {
        type: String,
        required: false,
        maxlength: 32,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // middle name is optional
                return /^[a-zA-Z]+$/.test(v);
            },
            message: (props) => `${props.path} must contain only alphabets`,
        },
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]+$/.test(v);
            },
            message: (props) => `${props.path} must contain only alphabets`,
        },
    },
    suffix: {
        type: String,
        required: false,
        maxlength: 3,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // suffix is optional
                const validSuffixes = ['Jr.', 'Sr.', 'III', 'IV'];
                return validSuffixes.includes(v);
            },
            message: (props) => {
                console.log(props);
                return `Suffix:${props.value} is not a valid suffix`;
            },
        },
    },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                // check if date is in the future
                return v && v.getTime() < new Date().getTime();
            },
            message: 'Birthdate must be in the past',
        },
    },
    address: {
        type: new mongoose.Schema(
            {
                houseNumber: {
                    type: String,
                    required: true,
                    maxlength: 32,
                    trim: true,
                },
                street: {
                    type: String,
                    required: true,
                    maxlength: 32,
                    trim: true,
                },
                barangay: {
                    type: String,
                    required: false,
                    maxlength: 32,
                    trim: true,
                },
                city: {
                    type: String,
                    required: false,
                    maxlength: 32,
                    trim: true,
                },
            },
            {
                _id: false,
            }
        ),
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        maxlength: 11,
        minlength: 10,
        trim: true,
        validate: {
            validator: function (v) {
                return v[0] === '0' || v[0] === '9';
            },
        },
    },
});

StaffDetailsSchema.methods.toJSON = function () {
    const staff = this;
    const staffObject = staff.toObject();

    delete staffObject.__v;

    return staffObject;
};

const StaffDetails = mongoose.model('StaffDetails', StaffDetailsSchema);
module.exports = StaffDetails;
