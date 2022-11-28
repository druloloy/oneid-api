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

exports.selectFromQueue = (socket, namespace) => {
    return async (id) => {
        try {
            const patientDetails = await PatientDetails.findById(id);
            const patientMedical = await PatientMedical.findById(id);
            const patientConsultation = await PatientConsultation.find({
                patientId: id,
            }).sort({ createdAt: -1 });

            if (!patientDetails)
                throw new SocketException(
                    'connect_failed',
                    'Patient not found!'
                );

            await Queue.deleteOne({
                _id: patientDetails._id,
            });

            const patient = {
                _id: patientDetails._id,
                details: patientDetails.toJSON(),
                medical: patientMedical.toJSON(),
                consultation: patientConsultation.toJSON(),
            };

            socket.emit('queue::one', patient);
            await this.getAllInQueue((patients) => {
                namespace.to('queue').emit('queue::all', patients);
            });
        } catch (error) {
            return socketErrorHandler(error, socket);
        }
    };
};

exports.getAllInQueue = async (callback) => {
    const patients = await Queue.find().select('+_id').sort({ queueNumber: 1 });
    callback(patients);
};
