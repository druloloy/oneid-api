const mongoose = require('mongoose');

const BruteForceSchema = {
    _id: { type: String },
    data: {
        count: Number,
        lastRequest: Date,
        firstRequest: Date,
    },
    expires: { type: Date, index: { expires: '2h' } },
};

module.exports = mongoose.model('Bruteforce', BruteForceSchema);
