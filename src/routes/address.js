const express = require("express");
//const { requireSignin, userMiddleware } = require('../common-middleware');
const { requireLogin, middleware } = require("../Validators/validation");
const {
  addAddress,
  addZipCodes,
  getAddress,
  getZipCodes,
  deleteAddress,
  modifyAddress,
  setDefaultAddress,
} = require("../controller/address");

const router = express.Router();
router.get("/fetch", requireLogin, getAddress);
router.post("/create", requireLogin, addAddress);
router.patch("/update", requireLogin, modifyAddress);
router.delete("/delete", requireLogin, deleteAddress);
router.patch("/default", requireLogin, setDefaultAddress);
router.get("/zipcodes", getZipCodes);

//TEMP
router.post("/zipcodes", requireLogin, addZipCodes);

module.exports = router;
