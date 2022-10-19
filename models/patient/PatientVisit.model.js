const mongoose = require('mongoose');

const PatientVisitSchema = new mongoose.Schema({
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
            'COVID Vaccine',
            'Other Vaccine',
            'Family Planning',
            'NCD Checkup',
            'Dental Checkup',
            'Other',
        ],
        required: true,
    },
});

module.exports = mongoose.model('PatientVisit', PatientVisitSchema);
