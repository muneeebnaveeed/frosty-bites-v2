const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User,validate} = require('../models/user');
const express = require('express');
const router = express.Router();


router.post("/", async (req, res) => {
    let doc = await User.findOne({ email: req.body.email });
    if(doc){        
        if(bcrypt.compareSync(req.body.password, doc.password)){
            const payload = { _id: doc._id, name: doc.name, email: doc.email };
                
            res.json({
                result: "success",
                name: doc.name,
                token: jwt.sign(payload, config.get('jwtPrivateKey') ),
                message: "Login successfully" });
    
        }else{
            res.json({ result: "error", message: "Invalid email or password" });
        }
    }else
        res.json({ result: "error", message: "Invalid email or password" });

  });

module.exports = router;
