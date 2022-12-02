const SocketException = require('../error/SocketException');
const socketErrorHandler = require('../error/socketErrorHandler');
const Queue = require('../models/patient/Queue.model');
const aes = require('../security/aes/aes');
const { PatientDetails } = require('../models/patient/PatientDetails.model');
const PatientMedical = require('../models/patient/PatientMedical.model');
const PatientConsultation = require('../models/patient/PatientConsultation.model');

exports.addToQueue = (socket, namespace) => {
    return async (id, purpose) => {
        try {
            const patient = await PatientDetails.findOne({
                _id: aes.decrypt(id), // id from scanner should be encrypted so we s
                // hould decrypt it for us to understand
            });

            if (!patient) {
                throw new SocketException(
                    'connect_failed',
                    'Patient not found!'
                );
            }

            const queue = new Queue({
                _id: patient._id,
                patient,
                purpose,
            });

            await queue.save();

            socket.emit('success', 'Patient added to queue');
            await this.getAllInQueue((patients) => {
                namespace.to('queue').emit('queue::all', patients);
            });
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.removeFromQueue = (socket, namespace) => {
    return async (id) => {
        try {
            const patient = await PatientDetails.findById(id);
            if (!patient) {
                throw new SocketException(
                    'connect_failed',
                    'Patient not found!'
                );
            }

            await Queue.deleteOne({
                _id: patient._id,
            });

            socket.emit('success', 'Patient removed from queue');
            await this.getAllInQueue((patients) => {
                namespace.to('queue').emit('queue::all', patients);
            });
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.toggleStatus = (socket, namespace) => {
    return async (id, status) => {
        try {
            const patient = await Queue.findOne({
                _id: id,
            });

            await patient.toggleStatus(status);
            await this.getAllInQueue((patients) => {
                namespace.to('queue').emit('queue::all', patients);
            });
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.getPatientQueueNumber = async (socket, namespace) => {
    return async (id) => {
        try {
            const patient = await Queue.findOne({
                _id: id,
            });

            if (!patient) {
                throw new SocketException(
                    'connect_failed',
                    'Patient not found!'
                );
            }

            namespace.to('queue').emit('queue::number', patient);
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.getQueueSize = async (socket, namespace) => {
    return async () => {
        try {
            const size = await Queue.countDocuments();
            namespace.to('queue').emit('queue::size', size);
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.getOngoingQueue = async (socket, namespace) => {
    return async () => {
        try {
            const patient = await Queue.findOne({
                status: 'Ongoing',
            });

            namespace.to('queue').emit('queue::ongoing', patient.queueNumber);
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.getAllInQueue = async (callback) => {
    const patients = await Queue.find().select('+_id').sort({ queueNumber: 1 });
    callback(patients);
};
