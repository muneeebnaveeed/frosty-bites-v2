const router = require('express').Router();
const autoParams = require('../../utils/autoParams');

const { getAll, addOne } = require('../../controllers/v2/tags.controller');

router.get('/', autoParams, getAll);
router.post('/', addOne);

module.exports = router;
