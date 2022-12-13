const {
    addToQueue,
    removeFromQueue,
    getAllInQueue,
    getPatientQueueNumber,
    getOngoingQueue,
    getQueueSize,
    toggleStatus,
} = require('../controllers/queue.controller');

exports.staffConnection = async (socket) => {
    const nsp = socket.nsp;

    socket.join('queue');

    await getAllInQueue((patients) => {
        nsp.to('queue').emit('queue::all', patients);
    });

    // add to queue
    socket.on('queue::add', addToQueue(socket, nsp));

    // remove from queue
    socket.on('queue::remove', removeFromQueue(socket, nsp));

    // toggle queue status
    socket.on('queue::toggle', toggleStatus(socket, nsp));
};

exports.patientConnection = async (socket) => {
    const nsp = socket.nsp;
    socket.join('queue');

    socket.emit('queue::id', socket.user._id.toString());

    await getAllInQueue((patients) => {
        nsp.to('queue').emit('queue::all', patients);
    });
};
