const zod = require('zod');
const { objectIdSchema } = require('./misc.validation');

const productSchema = zod.object({
    name: zod
        .string({ required_error: 'Product name is required' })
        .trim()
        .min(1, 'Product name is required')
        .max(55, 'Product name is too long'),
    price: zod.number({ required_error: 'Product price is required' }).min(0, 'Invalid product price'),
    tags: zod.array(objectIdSchema),
});

module.exports = productSchema;
