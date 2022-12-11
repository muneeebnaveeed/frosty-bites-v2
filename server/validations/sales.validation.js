const zod = require('zod');
const _isNill = require('lodash/isNil');
const { objectIdSchema } = require('./misc.validation');

const saleProductSchema = zod.object({
    _id: objectIdSchema,
    quantity: zod.number({ required_error: 'Product quanitity is required' }).min(1, 'Invalid product quantity'),
});

const saleSchema = zod
    .object({
        discount: zod.number().min(0, 'Invalid discount').max(100, 'Invalid discount').default(0),
        products: zod
            .array(saleProductSchema, { required_error: 'Please enter products' })
            .min(1, 'Please enter products'),
        saleType: zod.enum(['Dine-in', 'Takeaway', 'Delivery']),
        deliveryCharges: zod.number().min(0, 'Invalid delivery charges').optional(),
    })
    .superRefine((_sale, ctx) => {
        const { salesType, deliveryCharges } = _sale;
        if (salesType === 'Delivery' && _isNill(deliveryCharges))
            ctx.addIssue({
                path: ['deliveryCharges'],
                code: 'custom',
                message: 'Please enter delivery charges',
            });
    });

module.exports = saleSchema;
