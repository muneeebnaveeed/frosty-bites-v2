const mongoose = require('mongoose');
const Joi = require('joi');
const {productSchema, Product} = require('./product');

const Order = mongoose.model('Order', new mongoose.Schema({
    date: { type: Date, default: Date()},
    subtotal: {type: Number},
    discount: { type: Number},
    products : [{
        type: productSchema, ref: 'Product'
    }]    
}));

async function createOrder(saleprice, discount, products){
    const order = new Order({
        saleprice,
        discount,
        products
    });
    const result = await order.save();
    console.log(result);
}

async function listOrders(){
    const orders = await Order.find();
    console.log(orders);
}

async function updateProduct(orderId){
    const order = await Order.update({_id: orderId}, {
        $set: {
            "product.name" : "Mango"
        }
    });
    const result = await Order.find();
    console.log(result);
}
//  updateProduct("5ed5fb98dbdc980a5809f9b7");
// createOrder(900, 100, [
//     new Product({ "name": "Strawberry", "price": "400"}),
//     new Product({ "name": "Cherry", "price": "500"})
// ]);


function validateOrder(order){
    const schema = {
        // productId: Joi.objectId().required()
    };
    return Joi.validate(order, schema);    
}

exports.Order = Order;
exports.validate = validateOrder;