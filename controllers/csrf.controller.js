exports.getCsrfToken = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'CSRF token generated successfully',
            content: req.csrfToken(),
        });
    } catch (error) {
        return next(error);
    }
};
