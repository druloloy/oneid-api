const mongoose = require('mongoose');
const { PatientDetailsSchema } = require('./PatientDetails.model');

const QueueSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'PatientDetails',
        },
        patient: {
            type: PatientDetailsSchema,
            required: true,
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
        status: {
            type: String,
            enum: ['Waiting', 'Ongoing', 'Finished'],
            default: 'Waiting',
        },
    },
    {
        timestamps: true,
    }
);

QueueSchema.pre('findOneAndUpdate', async function (next) {
    const { status } = this.getUpdate();
    if (status === 'Ongoing') {
        this.timeServiced = Date.now();
    } else if (status === 'Finished') {
        this.timeEnded = Date.now();
    }
    next();
});

const QueueHistory = mongoose.model('QueueHistory', QueueSchema);
module.exports = QueueHistory;
