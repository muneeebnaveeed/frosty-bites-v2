const mongoose = require('mongoose');
const _ = require('lodash');
const Model = require('../../models/v2/salaries.model');

const { catchAsync } = require('../errors.controller');
const AppError = require('../../utils/AppError');
const Employee = require('../../models/employees.model');

module.exports.getAll = catchAsync(async function (req, res, next) {
    const { page, limit } = req.query;
    const docs = await Model.paginate(
        {},
        {
            projection: { __v: 0 },
            page,
            limit,
        }
    );
    res.status(200).json(_.omit(docs, ['nextPage', 'prevPage', 'page', 'limit', 'offset']));
});

module.exports.addOne = catchAsync(async function (req, res, next) {
    const body = _.pick(req.body, ['employee', 'amount']);
    if (!mongoose.isValidObjectId(body.employee)) return next(new AppError('Invalid employee id', 400));
    const employee = await Employee.findById(body.employee);
    if (!employee) return next(new AppError('Employee does not exist', 404));
    body.employee = employee;
    await Model.create(body);
    res.status(200).send();
});

module.exports.edit = catchAsync(async function (req, res, next) {
    const body = _.pick(req.body, ['employee', 'amount']);
    const salaryId = req.params.id;
    if (!mongoose.isValidObjectId(salaryId)) return next(new AppError('Invalid salary id', 400));

    const salary = Model.findById(salaryId);

    if (!salary) return next(new AppError('Salary does not exist', 404));

    if (!mongoose.isValidObjectId(body.employee)) return next(new AppError('Invalid employee id', 400));
    const employee = await Employee.findById(body.employee);
    if (!employee) return next(new AppError('Employee does not exist', 404));
    body.employee = employee;

    salary.employee = body.employee;
    salary.amount = body.amount;

    await salary.save();
    res.status(200).send();
});

module.exports.remove = catchAsync(async function (req, res, next) {
    let ids = req.params.id.split(',');

    for (const id of ids) {
        if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter valid id(s)', 400));
    }

    ids = ids.map((id) => mongoose.Types.ObjectId(id));

    await Model.deleteMany({ _id: { $in: ids } });

    res.status(200).json();
});
