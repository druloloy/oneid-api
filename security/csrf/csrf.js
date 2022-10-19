// const crypto = require('crypto');
// const secret = 'sample';

// const generateToken = () => {
//     const tokenLength = 32;
//     const token = crypto.randomBytes(tokenLength / 2).toString('hex');
//     return token;
// };

// const hashToken = (token) => {
//     const hash = crypto
//         .createHmac('sha256', secret)
//         .update(token)
//         .digest('base64url');
//     return hash;
// };

// const compareToken = (token, hash) => {
//     const newHash = hashToken(token);
//     return newHash === hash;
// };

// const verifyCsrf = (req, res, next) => {
//     // extract token in header
//     const hash =
//         req.headers['X-CSRF-TOKEN'] ||
//         req.headers['X-XSRF-TOKEN'] ||
//         req.headers['CSRF-TOKEN'] ||
//         req.headers['XSRF-TOKEN'] ||
//         req.headers['X-CSRF'] ||
//         req.headers['X-XSRF'] ||
//         req.headers['CSRF'] ||
//         req.headers['XSRF'];

//     const token =
//         req.cookies.csrf ||
//         req.cookies.xsrf ||
//         req.cookies.CSRF ||
//         req.cookies.XSRF;

//     if (!token || !hash) {
//         return res.status(403).json({
//             success: false,
//             message: 'CSRF token is missing',
//         });
//     }
//     if (!compareToken(token, hash)) {
//         return next(new Exception('CSRF token is invalid', 400));
//     }
//     next();
// };

// const csrf = (req, res, next) => {
//     const token = generateToken();

//     res.cookie('csrf', token, {
//         httpOnly: false,
//     });

//     req.csrfToken = () => {
//         return hashToken(token);
//     };
//     next();
// };

// module.exports = { csrf, verifyCsrf };
