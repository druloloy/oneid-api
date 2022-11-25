const router = require('express').Router();

router.post('/sample', (req, res) => {
    console.log(req.body);
    res.cookie('user', 'sample', {
        httpOnly: false,
        secure: false,
    });
    res.json({
        success: true,
        message: 'Sample route',
    });
});
router.get('/sample1', (req, res) => {
    res.cookie('user1', 'sample1', {
        httpOnly: true,
        secure: true,
    });
    res.json({
        success: true,
        message: 'Sample route1',
    });
});

module.exports = router;
