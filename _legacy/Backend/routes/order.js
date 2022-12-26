const auth = require('../middleware/auth');
const {Order,validate} = require('../models/order');
const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');


router.get('/',async(req,res)=>{
    const orders = await Order.find().sort("-date");
    res.send(orders);
});
router.post('/', async(req, res) =>{
    
    const order =new Order({  
        date: req.body.date,      
        subtotal: req.body.subtotal,
        discount: req.body.discount,
        products: req.body.products
    });
    await order.save();    

    
    res.send(order);

});
router.put('/:id',async (req,res)=>{
    const {error} = validate(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);
        
    const order = await Order.findByIdAndUpdate(req.params.id,{
        date: req.body.date,      
        subtotal: req.body.subtotal,
        discount: req.body.discount,
        products: req.body.products
    },{new: true});
  
    if(!order)
        return res.status(404).send('The order with the given ID not found.');

    res.send(order);
});
router.delete('/:id',async (req, res)=>{
    const order = await Order.findByIdAndRemove(req.params.id);
    if(!order)
        return  res.status(404).send('The Order with the given ID not found.');

    res.send(order);
});



router.get('/:id',async (req,res)=>{
    const order = await Order.findById(req.params.id);
    if(!course)
        return res.status(404).send('The order with the given ID not found.');
    res.send(order);
});

module.exports = router;
