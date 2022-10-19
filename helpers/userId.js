const crypto = require('crypto');
exports.generateId = (length) => {
    return crypto.randomBytes(length / 2).toString('hex');
};
