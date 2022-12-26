const mongoose = require('mongoose');
const _ = require('lodash');
const Model = require('../../models/v2/products.model');
const Purchase = require('../../models/v2/purchases.model').Model;
const Sale = require('../../models/v2/sales.model');
const Type = require('../../models/v2/types.model');
const { catchAsync } = require('../errors.controller');
const AppError = require('../../utils/AppError');
const Unit = require('../../models/v2/units.model');
const Tag = require('../../models/v2/tags.model');
const productSchema = require('../../validations/product.validation');

module.exports.getAll = catchAsync(async function (req, res, next) {
    const { page, limit, sort, search } = req.query;

    const results = await Model.paginate(
        {
            $or: [{ name: { $regex: `${search}`, $options: 'i' } }],
        },
        {
            populate: { path: 'tags', select: '_id name' },
            projection: { __v: 0 },
            lean: true,
            page,
            limit,
            sort,
        }
    );

    res.status(200).json(
        _.pick(results, ['docs', 'totalDocs', 'hasPrevPage', 'hasNextPage', 'totalPages', 'pagingCounter'])
    );
});

module.exports.getOne = catchAsync(async function (req, res, next) {
    const { id } = req.params;
    // const { inventoriesPage, inventoriesLimit, inventoriesSort, salesPage, salesLimit, salesSort } = req.query;

    if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter a valid id', 400));

    const product = await Model.findById(id, '-__v').lean();

    if (!product) return next(new AppError('Product does not exist', 404));

    // const inventories = await Purchase.paginate(
    //     { 'product._id': mongoose.Types.ObjectId(id) },
    //     {
    //         populate: { path: 'supplier', select: '-__v' },
    //         projection: { __v: 0 },
    //         lean: true,
    //         page: inventoriesPage,
    //         limit: inventoriesLimit,
    //         sort: inventoriesSort,
    //     }
    // );

    // let relevantInventoryIds = [];
    // inventories.docs.forEach((i) => {
    //     if (i.product && i.product._id) relevantInventoryIds.push(i.product._id.toString());
    // });

    // relevantInventoryIds = [...new Set(relevantInventoryIds)].map((inventoryId) =>
    //     mongoose.Types.ObjectId(inventoryId)
    // );

    // const sales = Sale.paginate(
    //     { 'inventory._id': { $in: relevantInventoryIds } },
    //     {
    //         populate: { path: 'customer', select: '-__v' },
    //         projection: { __v: 0 },
    //         lean: true,
    //         page: salesPage,
    //         limit: salesLimit,
    //         sort: salesSort,
    //     }
    // );

    res.status(200).json({
        product,
        // inventories: _.omit(inventories, ['page', 'prevPage', 'nextPage', 'limit']),
        // sales: _.omit(sales, ['page', 'prevPage', 'nextPage', 'limit']),
    });
});

module.exports.addOne = catchAsync(async function (req, res, next) {
    const parsedProduct = productSchema.parse(req.body);

    const correspondingTags = await Tag.find({ _id: { $in: parsedProduct.tags } }).count();

    const dedupedTagIds = [...new Set(parsedProduct.tags)];

    if (correspondingTags.length < dedupedTagIds.length) return new AppError(`One or more tags don't exist`, 404);

    await Model.create(parsedProduct);

    res.status(200).send();
});

module.exports.edit = catchAsync(async function (req, res, next) {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter a valid id', 400));

    const parsedProduct = productSchema.parse(req.body);

    await Model.findByIdAndUpdate(id, parsedProduct);

    res.status(200).json();
});
