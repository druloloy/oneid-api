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
        queueNumber: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

QueueSchema.pre('save', async function (next) {
    // get the last queue number
    const lastQueue = await Queue.findOne().sort({ queueNumber: -1 });
    if (!lastQueue) {
        this.queueNumber = 1;
        next();
    }

    this.queueNumber = lastQueue.queueNumber + 1;
    next();
});

const Queue = mongoose.model('Queue', QueueSchema);
module.exports = Queue;
