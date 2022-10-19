class SocketException extends Error {
    constructor(handle, message) {
        super(message);
        this.handle = handle;
    }
}
module.exports = SocketException;
