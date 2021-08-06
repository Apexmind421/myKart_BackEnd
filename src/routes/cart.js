const express = require("express");
const {
  addItemToCart,
  addItemToCart2,
  DisplayItemsInCart,
  removeItemFromCart,
  getCartItems,
  removeCartItems,
} = require("../controller/cart");
const { requireLogin, middleware } = require("../Validators/validation");
const router = express.Router();

router.post("/cart/addtocart", requireLogin, addItemToCart2);
router.get("/cart/fetchCart", requireLogin, DisplayItemsInCart);
router.get("/cart/removeFromCart", requireLogin, removeItemFromCart);
router.get("/user/getCartItems", requireLogin, getCartItems);
router.post("/user/cart/addtocart", requireLogin, addItemToCart);
router.post("/user/cart/removeItem", requireLogin, removeCartItems);
//router.post('/cart/addtocart', addItemToCart);

module.exports = router;
