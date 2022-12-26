const mongoose = require('mongoose');
const Joi = require('joi');

const Stock = mongoose.model('Stock', new mongoose.Schema({
    name: {type: String, required: true},
    quantity: {type: Number, required: true}
}));

function validateStock(stock){
    const schema = {
        name: Joi.string().min(3).required(),
        quantity: Joi.number().required()
    };
    return Joi.validate(stock, schema);    
}

exports.Stock = Stock;
exports.validate = validateStock;