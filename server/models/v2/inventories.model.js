const mongoose = require('mongoose');
const mongoosePagiante = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
    product: { type: mongoose.SchemaTypes.Mixed, required: [true, 'Please enter a product'] },
    quantity: Number,
    variants: {},
    createdAt: { type: Date, required: true, default: Date.now() },
});

schema.plugin(mongoosePagiante);

const Model = mongoose.model('Inventory', schema);

module.exports = Model;
