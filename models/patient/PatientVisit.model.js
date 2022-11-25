const mongoose = require('mongoose');

const PatientVisitSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        dateVisited: {
            type: Date,
            default: Date.now,
        },
        purpose: {
            type: String,
            enum: [
                'Consultation',
                'COVID-19 Vaccine',
                'Other Vaccine',
                'Family Planning',
                'NCD Checkup',
                'Dental Checkup',
                'Other',
            ],
            required: true,
        },
        waitingTime: {
            // in minutes
            type: Number,
            required: true,
        },
        consultationTime: {
            // in minutes
            type: Number,
            required: true,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = mongoose.model('PatientVisit', PatientVisitSchema);
