const express = require("express");
const router = express.Router();
const {
  addAttribute,
  fetchAttribute,
  deleteAttribute,
} = require("../controller/attribute");
const { requireLogin, middleware } = require("../Validators/validation");
router.post("/attribute/add", requireLogin, middleware, addAttribute);
router.get("/attribute", requireLogin, fetchAttribute);
router.delete("/attribute", requireLogin, middleware, deleteAttribute);

module.exports = router;
