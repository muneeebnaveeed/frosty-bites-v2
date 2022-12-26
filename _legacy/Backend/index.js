const express = require('express');
// const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const config = require('config');
const helmet = require('helmet');
const compression = require('compression');
const Joi = require('joi');
const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');
 
app.use((req, res, next)=>{
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, ");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader( "Access-Control-Expose-Headers" ,"x-auth-token")
    next();
});
 
require('./startup/routes')(app);
 
 
app.set('view engine','pug');
app.set('views','./views');
 
 
Joi.objectId = require('joi-objectid')(Joi);
 
app.use(helmet());
app.use(compression());
 
 
 
//const db = config.get('db');
mongoose.connect("mongodb://localhost/frostybites", {
     useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true})
    .then(() => winston.info('Connected to MongoDB..'));
 
    if(!config.get('jwtPrivateKey')){
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    }
 
const port = process.env.PORT || 3000;
app.listen(port,()=> winston.info(`Listening on port: ${port}` ));