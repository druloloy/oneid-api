const cookie = require('cookie');
const socketErrorHandler = require('../../error/socketErrorHandler');
const StaffLogin = require('../../models/staff/StaffLogin.model');
const PatientLogin = require('../../models/patient/PatientLogin.model');
const aes = require('../aes/aes');
const { verifySessionId } = require('../../helpers/sessionId');

exports.auth = async (socket, next) => {
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
};

exports.patientAuth = async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    const sid = cookies._sid;
    const uid = cookies._uid;

    if (!sid || !uid) {
        return socket.disconnect(true);
    }
    // decrypt uid
    const id = aes.decrypt(uid);

    // check if session is valid
    const patient = await PatientLogin.findOne({ _id: id });

    if (!patient) {
        return socket.disconnect(true);
    }

    const isValid = verifySessionId(sid); // checks if session id is expired
    if (!isValid) {
        return socket.disconnect(true);
    }

    const isMatch = patient.compareSession(sid);
    if (!isMatch) {
        return socket.disconnect(true);
    }

    socket.user = patient;

    next();
};
