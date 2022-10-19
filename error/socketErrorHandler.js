const SocketException = require('./SocketException');

const socketErrorHandler = (error, socket) => {
    let err = { ...error };
    err.message = error.message;

    if (err.code === 'ECONNREFUSED') {
        const message = 'Connection refused!';
        err = new SocketException('error', message);
    }
    if (err.code === 'ECONNRESET') {
        const message = 'Connection reset!';
        err = new SocketException('error', message);
    }
    if (err.code === 'ECONNABORTED') {
        const message = 'Connection aborted!';
        err = new SocketException('error', message);
    }
    if (err.code === 'EHOSTUNREACH') {
        const message = 'Host unreachable!';
        err = new SocketException('error', message);
    }
    if (err.code === 'EHOSTDOWN') {
        const message = 'Host down!';
        err = new SocketException('error', message);
    }
    if (err.code === 11000) {
        const notUnique = Object.keys(err.keyValue);
        const message = `Please provide a unique information for ${notUnique[0].replace(
            /_/,
            ''
        )}.`;
        err = new SocketException('error', message);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        err = new SocketException('error', message);
    }
    if (err.name === 'TypeError') {
        const message = 'Something went wrong!';
        err = new SocketException('error', message);
    }

    socket.emit(err.handle || 'error', err.message || 'Queue server error!');
};

module.exports = socketErrorHandler;
