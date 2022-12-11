const router = require('express').Router();

const autoParams = require('../../utils/autoParams');
const { getAll, addOne, remove, edit } = require('../../controllers/v2/inventories.controller');

router.get('/', autoParams, getAll);
router.route('/').post(addOne);
router.patch('/', edit);

router.route('/id/:id').delete(remove);

module.exports = router;
