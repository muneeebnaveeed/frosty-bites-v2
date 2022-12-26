module.exports = {
    PORT: process.env.PORT || 4000,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/frosty-bites',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
};
