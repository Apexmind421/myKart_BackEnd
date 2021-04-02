const express = require("express");
//const { requireSignin, userMiddleware } = require('../common-middleware');
const { requireLogin, middleware } = require("../Validators/validation");
const {
  addAddress,
  getAddress,
  deleteAddress,
  modifyAddress,
} = require("../controller/address");

const router = express.Router();
router.get("/user/getaddress", requireLogin, getAddress);
router.post("/user/address/create", requireLogin, addAddress);
router.patch("/user/address/update", requireLogin, modifyAddress);
router.delete("/user/deleteaddress", requireLogin, deleteAddress);

module.exports = router;
