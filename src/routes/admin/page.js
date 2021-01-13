const express = require('express');
//const { upload, requireLogin } = require('../../common-middleware');
const {requireLogin, upload, middleware} = require('../../Validators/validation');
const { createPage, getPage } = require('../../controller/admin/page');
const router = express.Router();


router.post(`/page/create`, requireLogin, upload.fields([
    { name: 'banners' },
    { name: 'products' }
]), createPage)

router.get(`/page/:category/:type`, getPage);

module.exports = router;