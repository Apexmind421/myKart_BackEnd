const express = require("express");
const router = express.Router();
const {
  addProduct,
  fetchProducts,
  fetchProductDetails,
  updateProductReviews,
  deleteProductById,
  fetchCartProductDetails,
  getProducts,
  fetchProductsBySlug,
  fetchProductDetailsById,
  getProductFilters,
  addProductReview,
} = require("../controller/product");
const { requireLogin, middleware } = require("../Validators/validation");
const shortid = require("shortid");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/product/add",
  requireLogin,
  upload.array("productImages"),
  addProduct
);
//router.post('/product/add',upload.array('productImages'), addProduct);
console.log("i am inside!");
router.get("/product/fetch", fetchProducts);
router.get("/product", fetchProductDetails);
router.get("/product/reviews", updateProductReviews);
router.get("/product/fetchCartProductDetails", fetchCartProductDetails);
//router.get('/product/getFilteredProducts',getProducts);
router.post("/product/getFilteredProducts", getProducts);
//router.get('/product/fetchcategories',fetchCategories);
router.get("/products/:slug", fetchProductsBySlug);
router.get("/product1/:productId", fetchProductDetailsById);
router.post("/product/getProductFilters", getProductFilters);
router.delete("/product/deleteProductById", requireLogin, deleteProductById);
router.post("/product/addProductReview", requireLogin, addProductReview);

module.exports = router;
