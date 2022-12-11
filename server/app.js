/* eslint-disable global-require */
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

const chalk = require('chalk');
const mongoose = require('mongoose');
const Database = require('./utils/db');
const AppError = require('./utils/AppError');

const tilesRoute = require('./routes/v2/products.route');
const customersRoute = require('./routes/v2/customers.route');
const employeesRoute = require('./routes/employees.route');
const suppliersRoute = require('./routes/v2/suppliers.route');
const typesRoute = require('./routes/v2/types.route');
const unitsRoute = require('./routes/v2/units.route');
const inventoriesRoute = require('./routes/v2/inventories.route');
const purchasesRoute = require('./routes/v2/purchases.route');

const salesRoute = require('./routes/v2/sales.route');
const expensesRoute = require('./routes/v2/expenses.route');
const salariesRoute = require('./routes/v2/salaries.route');

const dashboardRoute = require('./routes/dashboard.route');

const authRoute = require('./routes/auth.route');
const { errorController, catchAsync } = require('./controllers/errors.controller');
const { protect } = require('./controllers/auth.controller');
const Logger = require('./utils/logger');

const app = express();

dotenv.config({ path: path.resolve(process.cwd(), `.${process.env.NODE_ENV}.env`) });

const port = process.env.PORT || 5500;
const logger = Logger('app');

app.listen(port, () => {
    logger.info(`Server running on PORT ${chalk.green(port)}`);

    new Database()
        .connect()
        .then(() => logger.info('Connected to DB'))
        .catch((err) => logger.error('Unable to connect to DB', err));

    app.use(express.json());

    app.use(cors());

    app.get('/', (req, res) => {
        res.status(200).send(`Server running at PORT ${port}`);
    });

    app.use('/products', protect, tilesRoute);
    app.use('/customers', protect, customersRoute);
    app.use('/employees', protect, employeesRoute);
    app.use('/salaries', protect, salariesRoute);

    app.use('/suppliers', protect, suppliersRoute);
    app.use('/types', protect, typesRoute);
    app.use('/units', protect, unitsRoute);
    app.use('/inventories', protect, inventoriesRoute);
    app.use('/purchases', protect, purchasesRoute);
    app.use('/tags', protect, require('./routes/v2/tags.route'));

    app.use('/sales', protect, salesRoute);
    app.use('/expenses', protect, expensesRoute);
    app.use('/dashboard', protect, dashboardRoute);

    app.use('/auth', authRoute);

    app.delete(
        '/delete-entity/:model/:id',
        catchAsync(async function (req, res, next) {
            const { model } = req.params;
            if (!model) return next(new AppError('Please enter entity model', 400));
            let ids = req.params.id.split(',');

            for (const id of ids) {
                if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter valid id(s)', 400));
            }

            ids = ids.map((id) => mongoose.Types.ObjectId(id));

            await mongoose.model(model).deleteMany({ _id: { $in: ids } });

            res.status(200).json();
        })
    );

    app.use('*', (req, res, next) => next(new AppError(`Cannot find ${req.originalUrl} on the server!`, 404)));

    app.use(errorController);
});
