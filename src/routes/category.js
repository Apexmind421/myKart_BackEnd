const express = require('express');
const router = express.Router();
const { addCategory, fetchCategory, fetchCategories } = require('../controller/category');
const {requireLogin, middleware} = require('../Validators/validation');

router.post('/category/add', requireLogin, middleware, addCategory);

router.get('/category/fetch', requireLogin, fetchCategory);

router.get('/category/fetchcategories',fetchCategories);

module.exports = router;