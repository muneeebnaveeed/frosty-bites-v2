const zod = require('zod');

const tagSchema = zod.object({
    name: zod
        .string({ required_error: 'Tag name is required' })
        .trim()
        .min(1, 'Tag name is required')
        .max(25, 'Tag name is too long'),
});

module.exports = tagSchema;
