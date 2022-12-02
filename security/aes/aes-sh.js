const process = require('process');
const crypto = require('crypto');

const option = process.argv[2];
const text = process.argv[3];
const key = process.argv[4];
const iv = process.argv[5];

const aesOptions = {
    algorithm: 'aes-128-cbc',
    key: Buffer.from(process.env.AES_128CBC_KEY || key, 'base64url'),
    iv: Buffer.from(process.env.AES_128CBC_IV || iv, 'base64url'),
};

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let encrypted = cipher.update(text, 'utf-8', 'base64url');
    return (encrypted += cipher.final('base64url'));
};

const decrypt = (text) => {
    const decipher = crypto.createDecipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let decrypted = decipher.update(text, 'base64url', 'utf-8');
    return (decrypted += decipher.final('utf-8'));
};

(() => {
    if (option === 'encrypt') {
        console.log(encrypt(text));
    } else if (option === 'decrypt') {
        console.log(decrypt(text));
    } else {
        console.log('Invalid option');
    }
})();
