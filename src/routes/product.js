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

//Search Products
router.get("/product/fetch", fetchProducts);
router.post("/product/getFilteredProducts", getProducts);
router.post("/product/getProductFilters", getProductFilters);
router.get("/product/fetchTags", fetchTags);
router.get("/product", fetchProductDetails);
router.get("/products/:slug", fetchProductsBySlug);
router.get("/product1/:productId", fetchProductDetailsById);
router.get("/product/reviews", updateProductReviews);
router.get("/product/fetchCartProductDetails", fetchCartProductDetails);
//router.get('/product/getFilteredProducts',getProducts);
//router.get('/product/fetchcategories',fetchCategories);

//Delete Product

router.delete("/product/deleteProductById", requireLogin, deleteProductById);

//Add Product Details

router.post("/product/addProductReview", requireLogin, addProductReview);
router.post("/product/addProductVariant", requireLogin, addProductVariant);
router.post("/product/addProductTags", requireLogin, addProductTags);
router.post(
  "/product/addSpecificationsToProduct",
  requireLogin,
  addSpecificationsToProduct
);
router.post(
  "/product/addImagesToProduct",
  requireLogin,
  upload.array("productImages"),
  addImagesToProduct
);
/*
router.post(
  "/product/add",
  requireLogin,
  // upload.array("productImages"),
  addProduct
);*/
//router.post('/product/add',upload.array('productImages'), addProduct);
module.exports = router;
