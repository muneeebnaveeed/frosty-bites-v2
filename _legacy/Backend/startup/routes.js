const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const login = require('../routes/login');
const stock = require('../routes/stock');
const product = require('../routes/product');
const order = require('../routes/order');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');

module.exports = function(app){
    app.use(express.json()); // req.body
    app.use(express.urlencoded({extended: true})); // 
    app.use(express.static('public'));
    app.use(helmet());
    app.use(morgan('tiny')); 
    

    app.use('/api/login', login);
    app.use('/api/stock', stock);
    app.use('/api/product', product);
    app.use('/api/order', order);
    app.use('/api/users', users);
    app.use('/api/auth', auth);    


    app.use(error);
}
