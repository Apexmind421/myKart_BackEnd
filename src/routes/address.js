const express = require("express");
//const { requireSignin, userMiddleware } = require('../common-middleware');
const { requireLogin, middleware } = require("../Validators/validation");
const { addAddress, getAddress } = require("../controller/address");
const router = express.Router();

router.post("/user/address/create", requireLogin, addAddress);
router.get("/user/getaddress", requireLogin, getAddress);

module.exports = router;
