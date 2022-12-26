const mongoose = require('mongoose');
const Logger = require('./logger');
const { DB_CONNECTION_STRING } = require('../env');

const logger = Logger('app');

module.exports = class Database {
    constructor() {
        logger.debug('Created instance of DB');

        this.connectionString = DB_CONNECTION_STRING;
        this.authString = DB_CONNECTION_STRING;
    }

    getAuthString(password) {
        return this.connectionString.replace('<password>', password);
    }

    connect() {
        logger.debug('Connecting to DB...');

        return mongoose.connect(this.authString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
    }
};
