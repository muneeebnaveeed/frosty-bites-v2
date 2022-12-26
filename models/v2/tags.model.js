const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter product name'],
        },
    },
    { timestamps: true }
);

const Model = mongoose.model('Tag', schema);

module.exports = Model;
