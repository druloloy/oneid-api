const aes = require('../security/aes/aes');

exports.decryptString = (req, res, next) => {
    try {
        const { s } = req.query;
        res.status(200).json({
            success: true,
            content: aes.decrypt(s),
        });
    } catch (error) {
        next(error);
    }
};

exports.encryptString = (req, res, next) => {
    try {
        const { s } = req.query;
        res.status(200).json({
            success: true,
            content: aes.encrypt(s),
        });
    } catch (error) {
        next(error);
    }
};
