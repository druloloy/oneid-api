const mongoose = require('mongoose');
const { PatientDetailsSchema } = require('./PatientDetails.model');
const QueueHistory = require('./QueueHistory.model');

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
        expires: {
            type: Date,
            index: { expires: '10h' },
        },
    },
    {
        timestamps: true,
    }
);

QueueSchema.pre('save', async function (next) {
    // get the last queue number

    if (!this.isNew) return next();

    const lastQueue = await Queue.findOne().sort({ queueNumber: -1 });
    if (!lastQueue) {
        this.queueNumber = 1;
        next();
    }

    this.queueNumber = lastQueue.queueNumber + 1;
    next();
});

QueueSchema.methods.toggleStatus = async function (status) {
    this.status = status;
    if (status === 'Ongoing') {
        this.timeServiced = Date.now();
    } else if (status === 'Finished') {
        this.timeEnded = Date.now();
        // move to history
        const queue = await Queue.findOne(this._id);
        const queueHistory = new QueueHistory({
            patient: queue.patient,
            purpose: queue.purpose,
            timeStarted: queue.timeStarted,
            timeServiced: queue.timeServiced,
            timeEnded: queue.timeEnded,
        });
        await queueHistory.save();
        await queue.remove();

        return;
    }

    await this.save();
};

const Queue = mongoose.model('Queue', QueueSchema);
module.exports = Queue;
