const socketio = require('socket.io');
const socketErrorHandler = require('../error/socketErrorHandler');
const { auth, patientAuth } = require('../security/auth/socket-auth');

const {
    addToQueue,
    removeFromQueue,
    getAllInQueue,
    selectFromQueue,
} = require('../controllers/queue.controller');
const { staffConnection, patientConnection } = require('../socket/connection');

exports.init = (server) => {
    const io = socketio(server, {
        cors: {
            origin: '*',
        },
    });

    const staff = io.of('/live_staff');
    const patient = io.of('/live_patient');

    // authenticated socket
    staff.use(auth);
    patient.use(patientAuth);
    staff.on('connection', staffConnection);
    patient.on('connection', patientConnection);
    patient.on('disconnect', (socket) => {
        console.log('Disconnected!', socket.id);
    });
};
