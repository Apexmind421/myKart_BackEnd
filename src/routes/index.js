
const express = require("express");
const router= express();

//routes
const authRoutes = require("./auth");
const adminAuthRoutes = require("./admin/auth");
const catRoutes = require("./category");
const productRoutes = require("./product");
const historyRoutes = require("./productViews");
const cartRoutes = require("./cart");
const favoriteRoutes = require("./favorite");
const pageRoutes = require("./admin/page");
const addressRoutes = require("./address");
const initialDataRoutes = require("./admin/initialData");
const orderRoutes = require("./order");
const returnRequestRoutes = require("./returnRequest");
const questionRoutes = require("./questions");
const supportRoutes = require("./tickets");
const flashSaleRoutes = require("./flashSale");
const couponRoutes = require("./coupon");
const attributeRoutes = require("./attribute");
const dealRoutes = require("./deals");
const teamRoutes = require("./teams");
const settingsRoutes = require("./settings");


router.use("/auth", authRoutes);
router.use("/auth/admin", adminAuthRoutes);
router.use("/category", catRoutes);
router.use("/product", productRoutes);
router.use("/deal", dealRoutes);
router.use("/user/cart", cartRoutes);
router.use("/attribute", attributeRoutes);
router.use("/page", pageRoutes);
router.use("/user/address", addressRoutes);
router.use("/initial", initialDataRoutes);
router.use("/user/order", orderRoutes);
router.use("/user/order/return", returnRequestRoutes);
router.use("/product/question", questionRoutes); //Added Questions Route
router.use("/product/falsh-sale", flashSaleRoutes);
router.use("/user/favorite", favoriteRoutes);
router.use("/coupon", couponRoutes);
router.use("/team", teamRoutes);
router.use("/initial/setting", settingsRoutes);
router.use("/user/history", historyRoutes);
router.use("/support", supportRoutes);

module.exports = router;
