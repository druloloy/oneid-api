const mongoose = require('mongoose');

const PatientMedicalSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'PatientLogin',
        },
        height: {
            // in cm
            type: Number,
        },
        weight: {
            // in kg
            type: Number,
        },
        bloodPressure: {
            type: [
                new mongoose.Schema(
                    {
                        sys: {
                            type: Number,
                            required: true,
                            min: 0,
                            max: 500,
                        },
                        dia: {
                            type: Number,
                            required: true,
                            min: 0,
                            max: 500,
                        },
                        createdAt: {
                            type: Date,
                            required: true,
                            default: Date.now,
                        },
                    },
                    {
                        _id: false,
                    }
                ),
            ],
            required: false,
        },
        bloodGroup: {
            type: String,
            required: true,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
            default: 'Unknown',
        },
        allergies: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

PatientMedicalSchema.methods.toJSON = function () {
    const patientMedical = this;
    const patientMedicalObject = patientMedical.toObject();

    delete patientMedicalObject._id;
    delete patientMedicalObject.__v;
    delete patientMedicalObject.createdAt;

    return patientMedicalObject;
};

PatientMedicalSchema.methods.addAllergy = function (allergy) {
    this.allergies.push(allergy);
    this.save();
};

PatientMedicalSchema.methods.removeAllergy = function (allergy) {
    this.allergies = this.allergies.filter((a) => a !== allergy);
    this.save();
};

PatientMedicalSchema.methods.addBloodPressure = function (sys, dia) {
    this.bloodPressure.push({ sys, dia });
    this.save();
};

PatientMedicalSchema.methods.removeRecentBloodPressure = function () {
    this.bloodPressure.pop();
    this.save();
};

const PatientMedical = mongoose.model('PatientMedical', PatientMedicalSchema);
module.exports = PatientMedical;
