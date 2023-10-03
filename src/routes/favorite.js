const express = require("express");
const {
  addItemToWishList1,
  updateToWishList,
  removeItemFromWishList,
  fetchWishList,
  deleteWishListById,
  fetchAllWishlistProducts,
} = require("../controller/favorite");
const { requireLogin, middleware } = require("../Validators/validation");
const router = express.Router();

router.post("/favorite/product/add", requireLogin, updateToWishList);
router.get("/favorite/user", requireLogin, fetchWishList);
router.get("/favorite/all/products", requireLogin, fetchAllWishlistProducts);
router.delete("/favorite", requireLogin, deleteWishListById);

//router.post("/favorite/product/add1", requireLogin, addItemToWishList1);
//router.patch("/favorite/product/remove", requireLogin, removeItemFromWishList);

module.exports = router;
