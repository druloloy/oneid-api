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

const app = express();
const port = process.env.PORT || 5000;

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
        origin: '*',
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

// patient
app.use(base + '/patient', require('./routes/patient.route'));

// staff
app.use(base + '/staff', require('./routes/staff.route'));

// csrf
app.use(base + '/csrf', require('./routes/csrf.route'));

app.use('/', require('./routes/sample.route'));

// error handler
app.use(errorHandler);

// transfer express app to vanilla http server
const server = require('http').createServer(app);

// start queue server
QServer.init(server);

server.listen(port, () => console.log(`Server started on port ${port}`));

const rejectionHandler = (err) => {
    console.warn('Server timed out!');
    console.log(`ERROR LOG: ${err}`);
    server.close(() => process.exit(1));
};

process.on('unhandledRejection', rejectionHandler);
