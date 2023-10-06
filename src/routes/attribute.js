const express = require("express");
const router = express.Router();
const {
  addAttribute,
  fetchAttribute,
  deleteAttribute,
} = require("../controller/attribute");
const { requireLogin, middleware } = require("../Validators/validation");
router.post("/add", requireLogin, middleware, addAttribute);
router.get("/", requireLogin, fetchAttribute);
router.delete("/", requireLogin, middleware, deleteAttribute);

module.exports = router;
