const express = require("express");
const router = express.Router();
const {
  addAttribute,
  fetchAttribute,
  deleteAttribute,
} = require("../controller/attribute");
const { requireLogin, middleware } = require("../Validators/validation");
router.post("/attribute/add", requireLogin, addAttribute);
router.post("/attribute/get", requireLogin, fetchAttribute);
router.delete("/attribute", requireLogin, deleteAttribute);

module.exports = router;
