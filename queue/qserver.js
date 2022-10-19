const socketio = require('socket.io');
const cookie = require('cookie');
const socketErrorHandler = require('../error/socketErrorHandler');
const StaffLogin = require('../models/staff/StaffLogin.model');
const aes = require('../security/aes/aes');
const { verifySessionId } = require('../helpers/sessionId');

const {
    addToQueue,
    removeFromQueue,
    getAllInQueue,
    selectFromQueue,
} = require('../controllers/queue.controller');

exports.init = (server) => {
    const io = socketio(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    const live = io.of('/live');

    live.use(async (socket, next) => {
        // authenticate session
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        const sid = cookies._sid;
        const uid = cookies._uid;

        if (!sid || !uid) {
            return socket.disconnect(true);
        }
        // decrypt uid
        const id = aes.decrypt(uid);

        // check if session is valid
        const staff = await StaffLogin.findOne({ _id: id });

        if (!staff) {
            return socket.disconnect(true);
        }

        const isValid = verifySessionId(sid); // checks if session id is expired
        if (!isValid) {
            return socket.disconnect(true);
        }

        const isMatch = staff.compareSession(sid);
        if (!isMatch) {
            return socket.disconnect(true);
        }

        socket.user = staff;

        next();
    });

    live.on('connection', async (socket) => {
        console.log('QUEUE SERVER: Client connected!');
        // console.log(Object.getOwnPropertyNames(live));
        socket.join('queue');

        await getAllInQueue((patients) => {
            live.to('queue').emit('queue::all', patients);
        });

        // add to queue
        socket.on('queue::add', addToQueue(socket, live));

        // remove from queue
        socket.on('queue::remove', removeFromQueue(socket, live));

        // select from queue
        socket.on('queue::select', selectFromQueue(socket, live));

        socket.on('disconnect', () => {
            console.log('QUEUE SERVER: Client disconnected');
        });
    });
};
