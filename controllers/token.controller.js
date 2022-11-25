exports.validateSession = (req, res, next) => {
    return res.status(200).json({
        message: 'Token is valid',
    });
};
