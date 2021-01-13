const express = require('express');
const { requireLogin, middleware } = require('../../Validators/validation');
const { initialData } = require('../../controller/admin/inititalData');
const router = express.Router();


router.post('/initialdata', requireLogin, middleware, initialData);


module.exports = router;