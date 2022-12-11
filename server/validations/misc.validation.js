const mongoose = require('mongoose');
const zod = require('zod');

const objectIdSchema = zod.string().refine(mongoose.isValidObjectId, 'Invalid entity id');

module.exports = { objectIdSchema };
