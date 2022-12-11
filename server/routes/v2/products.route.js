const router = require('express').Router();
const autoParams = require('../../utils/autoParams');

const { getAll, addOne, edit, getOne } = require('../../controllers/v2/products.controller');

router.get('/', autoParams, getAll);
router.get('/id/:id', autoParams, getOne);
router.route('/').post(addOne);
router.route('/id/:id').patch(edit);

module.exports = router;
