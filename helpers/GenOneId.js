const qrcode = require('qrcode');
const html2img = require('node-html-to-image');
const aes = require('../security/aes/aes');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = async function (id, name = { firstName, lastName, suffix }) {
    const { firstName, lastName, suffix } = name;

    const html = fs.readFileSync('./views/_id.html', 'utf8');
    const qr = await qrcode.toDataURL(id, {
        version: 5,
    });

    const content = {
        firstName,
        lastName,
        suffix,
        qr,
    };

    const imageId = await html2img({
        html,
        content,
        puppeteerArgs: {
            args: ['--no-sandbox'],
        },
    });

    // return base64 image
    return imageId.toString('base64');
};
