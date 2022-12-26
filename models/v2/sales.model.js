const mongoose = require('mongoose');
const mongoosePagiante = require('mongoose-paginate-v2');

const schema = new mongoose.Schema(
    {
        products: { type: mongoose.SchemaTypes.Mixed, required: [true, 'Please enter products'] },
        subtotal: Number,
        discount: Number,
        total: Number,
        saleId: String,
        saleType: { type: String, enum: ['Dine-in', 'Takeaway', 'Delivery'] },
        deliveryCharges: Number,
    },
    { timestamps: true }
);

schema.plugin(mongoosePagiante);

const Model = mongoose.model('Sale', schema);

module.exports = Model;
