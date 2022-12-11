const Model = require('../../models/v2/tags.model');
const { catchAsync } = require('../errors.controller');
const tagSchema = require('../../validations/tag.validation');
const { objectIdSchema } = require('../../validations/misc.validation');

module.exports.getAll = catchAsync(async function (req, res, next) {
    const results = await Model.find({}, '-__v');
    res.status(200).json(results);
});

module.exports.addOne = catchAsync(async function (req, res, next) {
    const parsedTag = tagSchema.parse(req.body);

    const createdTag = await Model.create(parsedTag);

    res.status(200).send(createdTag);
});
