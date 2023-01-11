const mongoose = require('mongoose');
const { PatientDetailsSchema } = require('./PatientDetails.model');

const QueueSchema = new mongoose.Schema(
    {
        patient: {
            type: PatientDetailsSchema,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
        },
        timeStarted: {
            type: Date,
            default: Date.now,
        },
        timeServiced: {
            type: Date,
            required: false,
        },
        timeEnded: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const QueueHistory = mongoose.model('QueueHistory', QueueSchema);
module.exports = QueueHistory;
