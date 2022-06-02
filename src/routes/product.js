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
  addSpecificationsToProduct,
  addImagesToProduct,
  addProductVariant,
  addProductTags,
  fetchTags,
  addOptions,
  fetchProductVariantOptions,
  addProductOptions,
  fetchOptions,
  getProductFilters2,
} = require("../controller/product");
const { requireLogin } = require("../Validators/validation");
const shortid = require("shortid");
const multer = require("multer");
const path = require("path");
const ALLOWED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const storage1 = multer.memoryStorage();

const upload = multer({
  storage1,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not supported file type!"), false);
    }
  },
});

/*const upload = multer({ storage });*/

//Create Product
router.post(
  "/product/add",
  requireLogin,
  upload.array("productImages"),
  addProduct
);

//Add Options
router.post("/variantOption/add", requireLogin, addOptions);
router.get("/variantOption", fetchOptions);

//Add Product Details
router.post("/product/addProductReview", requireLogin, addProductReview); //AddProductReview
router.post("/product/variant/add", requireLogin, addProductVariant); //AddProductVariant
router.post("/product/tag/add", requireLogin, addProductTags); //AddProductTag
router.post("/product/option/add", requireLogin, addProductOptions); //AddProductOptions
router.post(
  "/product/specification/add",
  requireLogin,
  addSpecificationsToProduct
);
router.post(
  "/product/addImagesToProduct",
  requireLogin,
  upload.array("productImages"),
  addImagesToProduct
);

//Search Products
router.get("/product/fetch1", fetchProducts);
router.post("/product/getFilteredProducts", getProducts);
router.post("/product/fetch", getProductFilters2);
router.post("/product/getProductFilters", getProductFilters);
router.get("/product/fetchTags", fetchTags);
router.get("/product", fetchProductDetails);
router.get("/products/:slug", fetchProductsBySlug);
router.get("/product/details/:productId", fetchProductDetailsById);
router.get("/product/reviews", updateProductReviews);
router.get("/product/fetchCartProductDetails", fetchCartProductDetails);
router.get("/product/variantOption", fetchProductVariantOptions);
//router.get('/product/getFilteredProducts',getProducts);
//router.get('/product/fetchcategories',fetchCategories);

//Delete Product

router.delete("/product/deleteProductById", requireLogin, deleteProductById);

/*
router.post(
  "/product/add",
  requireLogin,
  // upload.array("productImages"),
  addProduct
);*/
//router.post('/product/add',upload.array('productImages'), addProduct);

module.exports = router;
