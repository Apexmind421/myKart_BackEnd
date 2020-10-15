const express = require('express');
const router = express.Router();
const { addProduct, fetchProducts } = require('../controller/product');
const {requireLogin, middleware} = require('../Validators/validation');
const shortid = require('shortid');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(path.dirname(__dirname),'/uploads/'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, shortid.generate()+'-'+file.originalname)
    }
  })
  
const upload = multer({storage});

router.post('/product/add',requireLogin,upload.array('image'), addProduct);

router.get('/product/fetch', requireLogin, fetchProducts);

//router.get('/product/fetchcategories',fetchCategories);

module.exports = router;