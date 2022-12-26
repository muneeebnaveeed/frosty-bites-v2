const winston = require('winston');

module.exports = function(err, req, res, next){
    winston.log(err.message, err);
    //error
    //warn.
    //info
    //verbose
    //debug
    //silly


    res.status(500).send('Something failed.');
};