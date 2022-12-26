const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const {Stock,validate} = require('../models/stock');
const express = require('express');
const router = express.Router();



router.get('/', async(req,res)=>{
    const stocks = await Stock.find();
    
    res.send(stocks);    
});

router.put('/:id',async (req,res)=>{
    const {error} = validate(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);
    
    const oldStock = await Stock.findById(req.params.id);
    const newquantity = parseFloat(oldStock.quantity) + parseFloat(req.body.quantity);
    console.log(parseFloat(oldStock.quantity));
    if(newquantity<0)
        return res.status(404).send('"quantity" must be larger than or equal to 0');

    const stock = await Stock.findByIdAndUpdate(req.params.id,{
        quantity: newquantity
    },{new: true});

    if(!stock)
        return res.status(404).send('The stock with the given ID not found.');

    res.send(stock);
});

router.post('/', async(req, res) =>{
       // Validate
    const {error} = validate(req.body);
    if(error){
        // 400 Bad Request
        return res.status(400).send(error.details[0].message);        
    }
    if(req.body.quantity<0)
    return res.status(404).send('"quantity" must be larger than or equal to 0');

    const stock =new Stock({        
        name: req.body.name,
        quantity: req.body.quantity
    });
    await stock.save();
    res.send(stock);

});

router.delete('/:id',async (req, res)=>{
    const stock = await Stock.findByIdAndRemove(req.params.id);
    if(!stock)
        return  res.status(404).send('The Stock with the given ID not found.');

    res.send(stock);
});
router.get('/:id',async (req,res)=>{
    const stock = await Stock.findById(req.params.id);
    if(!stock)
        return res.status(404).send('The stock with the given ID not found.');
    res.send(stock);
});

module.exports = router;
