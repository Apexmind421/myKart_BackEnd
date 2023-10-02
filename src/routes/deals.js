const express = require("express");
const { createPriceChop, updatePriceChop } = require("../controller/priceChop");
const { requireLogin, middleware } = require("../Validators/validation");
const router = express.Router();
router.post("/deal/price-chop/add", requireLogin, createPriceChop);
router.put("/deal/price-chop/update", requireLogin, updatePriceChop);

module.exports = router;
