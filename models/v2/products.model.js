const mongoose = require('mongoose');
const mongoosePagiante = require('mongoose-paginate-v2');

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter product name'],
        },
        price: {
            type: Number,
            required: [true, 'Please enter produce price'],
        },
        tags: [{ type: mongoose.ObjectId, ref: 'Tag' }],
    },
    { timestamps: true }
);

schema.plugin(mongoosePagiante);
const Model = mongoose.model('Product', schema);

module.exports = Model;
