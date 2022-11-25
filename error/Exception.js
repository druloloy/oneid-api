class Exception extends Error {
    constructor(message, code, authenticated = false) {
        super(message);
        this.statusCode = code;
        this.authenticated = authenticated;
    }
}
module.exports = Exception;
