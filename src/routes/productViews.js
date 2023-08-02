const express = require("express");
const { getProductViews } = require("../controller/productViews");
const { requireLogin, middleware } = require("../Validators/validation");
const router = express.Router();

router.get("/history/product/views", getProductViews);

module.exports = router;
