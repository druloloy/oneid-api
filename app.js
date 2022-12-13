if (process.env.NODE_ENV != 'production') require('dotenv').config();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const MongoDB = require('./db/connect');
const errorHandler = require('./error/errorHandler');
const { shortdatems, shortdate } = require('./helpers/shortdate');
const csrf = require('csurf');
const QServer = require('./queue/qserver');
const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');
const Bruteforce = require('./models/security/Bruteforce.model');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const bruteStore = new MongooseStore(Bruteforce);
const bruteForce = new ExpressBrute(bruteStore, {
    freeRetries: 4,
    minWait: 1 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour,
    failCallback: (req, res, next, nextValidRequestDate) => {
        // time left
        const timeLeft = Math.ceil((nextValidRequestDate - Date.now()) / 1000); // in seconds
        res.status(403).json({
            message: `Too many requests. Try again after ${timeLeft} seconds.`,
            status: 403,
            timestamp: new Date(),
            path: '/',
        });
    },
});

exports.bruteForce = bruteForce;

const version = 'v1';
const base = `/api/${version}`;
const csrfProtection = csrf({
    cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: shortdatems('7d'),
        key: '_xc',
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    value: (req) => req.cookies['xs'],
});

app.use(express.json());
app.use(
    cors({
        origin: [
            '*',
            'https://oneid-clinic.netlify.app',
            'https://oneid-admin.netlify.app',
        ],
        credentials: true,
    })
);
app.use(
    cookieParser('secret', {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: shortdatems('7d'),
    })
);

app.use(
    compression({
        level: 6,
        threshold: 100 * 1000, // 1kb
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        },
    })
);

// csrf middleware
// app.use(csrfProtection, (req, res, next) => {
//     res.cookie('xs', req.csrfToken(), {
//         httpOnly: process.env.NODE_ENV === 'production',
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//     });
//     next();
// });

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.set('view engine', 'ejs');
app.get('/queue', (_req, res) => {
    res.render('index');
});

// connect to database
MongoDB.connect();

// bind req.isAuthenticated function
app.use((req, res, next) => {
    req.isAuthenticated = () => false;
    next();
});

app.use('/static', express.static(path.join(__dirname, '/views')));

// patient
app.use(base + '/patient', require('./routes/patient.route'));

// staff
app.use(base + '/staff', require('./routes/staff.route'));

// csrf
app.use(base + '/csrf', require('./routes/csrf.route'));

// admin
app.use(base + '/admin', require('./routes/admin.route'));

// stats
app.use(base + '/stats', require('./routes/stats.route'));

// security / encryption
app.use(base + '/security', require('./routes/security.route'));

// experimental
app.use(base + '/dev', require('./routes/sample.route'));

// error handler
app.use(errorHandler);

// transfer express app to vanilla http server
const server = require('http').createServer(app);

// start queue server
QServer.init(server);

server.listen(port, () => {
    console.log(`Server is running.`);
});

const rejectionHandler = (err) => {
    console.warn('Server timed out!');
    console.log(err);
    console.log(`ERROR LOG: ${err}`);
    server.close(() => process.exit(1));
};

process.on('unhandledRejection', rejectionHandler);
