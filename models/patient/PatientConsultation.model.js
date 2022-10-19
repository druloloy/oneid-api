const mongoose = require('mongoose');

const PatientConsultationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientLogin',
        required: true,
    },
    conditions: {
        type: [String],
        required: true,
        default: [],
    },
    treatments: {
        type: [String],
        required: false,
        default: [],
    },
    prescriptions: {
        type: [
            new mongoose.Schema({
                name: {
                    type: String,
                    required: true,
                },
                dosage: {
                    type: String,
                    required: true,
                },
                frequency: {
                    type: Number, // number of times per day
                    required: true,
                },
                // default to number of frequency / day
                interval: {
                    type: Number, // in hours
                    default: function () {
                        return 24 / this.frequency;
                    },
                },
                duration: {
                    type: Date,
                    required: true,
                },
                notes: {
                    type: String,
                    required: false,
                },
                createdAt: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
            }),
        ],
        required: false,
        default: [],
    },
    remarks: {
        type: String,
        required: false,
        default: 'No remarks',
    },
    nextConsultation: {
        type: Date,
        required: false,
    },
    consultatedBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        // ref: 'StaffLogin'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const PatientConsultation = mongoose.model(
    'PatientConsultation',
    PatientConsultationSchema
);

module.exports = PatientConsultation;
