const crypto = require('crypto');
const { shortdatems } = require('./shortdate');
const signature = process.env.ONEID_SIGNATURE;
const aesOptions = {
    algorithm: 'aes-128-cbc',
    key: Buffer.from(process.env.SESSION_KEY, 'base64'),
    iv: Buffer.from(process.env.SESSION_IV, 'base64url'),
};

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
    const sig = encryptSignature(signature);
    const final = `${sid}.${exp}.${sig}`;
    return final;
};

const verifySessionId = (sid) => {
    try {
        const [_id, exp, sig] = sid.split('.');
        const extracted = Buffer.from(exp, 'base64url').toString('utf-8');
        if (decryptSignature(sig) !== signature) return false;
        const date = new Date(parseInt(extracted));
        return date > new Date();
    } catch (error) {
        throw error;
    }
};

const encryptSignature = (signature) => {
    const cipher = crypto.createCipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let encrypted = cipher.update(
        signature.toString('base64url'),
        'utf8',
        'base64'
    );
    encrypted += cipher.final('base64');
    return encrypted;
};

const decryptSignature = (signature) => {
    const decipher = crypto.createDecipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let decrypted = decipher.update(
        signature.toString('base64url'),
        'base64',
        'utf8'
    );
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = {
    generateSessionId,
    verifySessionId,
};
