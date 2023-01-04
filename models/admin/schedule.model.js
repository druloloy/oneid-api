const mongoose = require('mongoose');
const ScheduleSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        day: {
            type: String,
            required: true,
            enum: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday',
            ],
            unique: true,
        },
        activities: {
            type: [String],
            required: false,
            default: [],
        },
        startTime: {
            type: String,
            required: false,
            default: '08:00',
        },
        endTime: {
            type: String,
            required: false,
            default: '17:00',
        },
    },
    {
        timestamps: false,
    }
);

ScheduleSchema.methods.updateActivities = async function (activities = []) {
    this.activities = activities;
    await this.save();
    return this;
};

ScheduleSchema.methods.updateTime = async function (startTime, endTime) {
    this.startTime = startTime || this.startTime;
    this.endTime = endTime || this.endTime;
    await this.save();
    return this;
};

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;
