module.exports = class AppError extends Error {
    constructor(message, statusCode, failureName = 'fail') {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode.toString().startsWith('4') ? failureName : 'error';
        this.isOperational = true;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    }
};
