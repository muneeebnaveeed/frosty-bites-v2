const _ = require('lodash');
const chalk = require('chalk');
const AppError = require('../utils/AppError');
const Logger = require('../utils/logger');

const logger = Logger('middleware');

function getCastError(err) {}
function getValidationError(err) {
    const errors = Object.values(err.errors).map((el) => {
        let { message } = el;
        if (message.includes('Cast to ObjectId failed')) message = 'Invalid id(s)';
        return message;
    });
    return new AppError(errors, 400);
}

function getDevelopmentError(err) {
    return {
        status: err.status,
        data: err.message,
        error: _.omit(err, ['stack']),
        stack: err.stack,
    };
}

function getZodError(err) {
    const errors = {};
    err.issues.forEach(($issue) => {
        errors[$issue.path[$issue.path.length - 1]] = $issue.message;
    });
    return new AppError(errors, 400, 'validationError');
}

function getProductionError(err) {
    return {
        status: err.status,
        data: err.message,
    };
}

module.exports.catchAsync = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
};

module.exports.errorController = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error(`${err.message} ${err.stack}`);

    let error = { ...err, name: err.name, stack: err.stack, message: err.message };

    if (error.name === 'CastError') error = getCastError(error);
    if (error.name === 'ValidationError') error = getValidationError(error);
    if (error.name === 'ZodError') error = getZodError(error);

    if (process.env.NODE_ENV === 'development') {
        const devError = getDevelopmentError(error);
        return res.status(error.statusCode).json(devError);
    }

    const prodError = getProductionError(error);
    return res.status(err.statusCode).json(prodError);
};
