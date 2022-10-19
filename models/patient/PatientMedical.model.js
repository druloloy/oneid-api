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
            required: true,
            min: 30,
            max: 300,
        },
        weight: {
            // in kg
            type: String,
            required: true,
            enum: [
                '1-10',
                '11-20',
                '21-30',
                '31-40',
                '41-50',
                '51-60',
                '61-70',
                '71-80',
                '81-90',
                '91-100',
                '101-110',
                '111-120',
                '121-130',
                '131-140',
                '141-150',
                '151-160',
                '161-170',
                '171-180',
                '181-190',
                '191-200',
                '201-210',
                '211-220',
                '221-230',
                '231-240',
                '241-250',
                '251-260',
                '261-270',
                '271-280',
                '281-290',
                '291-300',
                'Unknown',
            ],
            default: 'Unknown',
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
            default: 'unknown',
        },
        allergies: {
            type: [String],
            required: true,
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
