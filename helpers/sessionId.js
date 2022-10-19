const crypto = require('crypto');
const aes = require('../security/aes/aes');

const { shortdatems, shortdate } = require('./shortdate');

/**
 *
 * @param {string} expires Accepts a string in the format of 1d, 1m, 1y, 1h, 1s
 * @returns session id
 */
const generateSessionId = (expires) => {
    const id = crypto.randomBytes(32);
    const exp = Buffer.from(shortdatems(expires).toString(), 'utf-8').toString(
        'base64url'
    );
    const sid = crypto.createHash('md5').update(id).digest('base64url');
    return `${sid}.${exp}`;
};

const verifySessionId = (sid) => {
    try {
        const [_id, exp] = sid.split('.');
        const extracted = Buffer.from(exp, 'base64url').toString('utf-8');
        const date = new Date(parseInt(extracted));
        return date > new Date();
    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateSessionId,
    verifySessionId,
};
