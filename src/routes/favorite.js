const express = require("express");
const {
  addItemToWishList,
  removeItemFromWishList,
  fetchWishList,
  deleteWishListById,
} = require("../controller/favorite");
const { requireLogin, middleware } = require("../Validators/validation");
const router = express.Router();
console.log("I am here");
router.post("/favorite/addToWishList", requireLogin, addItemToWishList);
router.get(
  "/favorite/removeFromWishList",
  requireLogin,
  removeItemFromWishList
);
router.get("/favorite/fetchWishList", requireLogin, fetchWishList);
router.delete("/favorite/deleteWishListById", requireLogin, deleteWishListById);

module.exports = router;
