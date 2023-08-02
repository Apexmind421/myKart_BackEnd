const express = require("express");
const router = express.Router();
const {
  addProduct,
  updateProduct,
  fetchProducts,
  fetchProductDetails,
  deleteProductById,
  fetchCartProductDetails,
  getProducts,
  fetchProductsBySlug,
  fetchProductDetailsById,
  getProductFilters,
  //rating,
  //addProductReview,
  addSpecificationsToProduct,
  addImagesToProduct,
  addProductVariant,
  addProductTags,
  //TO DO: fetchTags,
  addAttributes,
  fetchProductVariantOptions,
  fetchProductVariants,
  updateProductVariant,
  deleteProductVariant,
  addProductAttributes,
  fetchAttributes,
  deleteAttributes,
  getProductFilters1,
  getProductFilters2,
  getProducts1,
  getProducts2,
} = require("../controller/product");
const {
  addProductReview,
  getProductReviews,
  deleteProductReviews,
} = require("../controller/reviews");
const { requireLogin } = require("../Validators/validation");
const shortid = require("shortid");
const multer = require("multer");
const path = require("path");
const { uploadImage } = require("../middlewares/uploadImage");
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

/////////////////Attribute Routes
router.post("/attribute/add", requireLogin, addAttributes);
router.get("/attribute", fetchAttributes);
router.delete("/attribute", requireLogin, deleteAttributes);

//Add Variant to Product--Done
//Remove Variant to Product
//Update the Product Varaint
//Fetch Varinat of the Product
router.post("/product/variant/add", requireLogin, addProductVariant); //AddProductVariant
router.get("/product/variant/", fetchProductVariants);
router.delete("/product/variant/", deleteProductVariant);
//router.get("/product/variantOption", fetchProductVariantOptions);
router.put("/product/variant", requireLogin, updateProductVariant);

////////////////Product Routes
router.post(
  "/product/add",
  requireLogin,
  upload.array("productImages", 8),
  addProduct
);
router.put(
  "/product/update/:id",
  requireLogin,
  // upload.array("productImages"),
  updateProduct
);
router.delete("/product/deleteProductById", requireLogin, deleteProductById);

/////////////////Product Detail Routes
router.post("/product/tag/add", requireLogin, addProductTags); //AddProductTag
router.post("/product/attribute/add", requireLogin, addProductAttributes); //AddProductOptions
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

/////////////////Product Search Routes
router.get("/product/fetch1", fetchProducts);
router.post("/product/getFilteredProducts", getProducts);
router.post("/product/getProductFilters", getProductFilters);
router.post("/product/fetch", getProducts1);
router.post("/product/fetch2", getProducts2);
//TO DO: router.get("/product/fetchTags", fetchTags);
router.get("/product/details", requireLogin, fetchProductDetails);
router.get("/products/:slug", fetchProductsBySlug);
router.get("/product/details/:productId", fetchProductDetailsById);
router.get("/product/fetchCartProductDetails", fetchCartProductDetails);

////////////////////////////Product Reviews
router.post(
  "/product/review",
  requireLogin,
  uploadImage.array("reviewImages", 5),
  addProductReview
);
router.get("/product/review", getProductReviews);
router.delete("/product/review", requireLogin, deleteProductReviews);

module.exports = router;

//Create Variant Set(Optional)
//Create Variant Options - Add, Fetch
//Create Product
//Create Product Varaint Option

/*
router.post(
  "/product/add",
  requireLogin,
  // upload.array("productImages"),
  addProduct
);*/
//router.post('/product/add',upload.array('productImages'), addProduct);

//router.get('/product/getFilteredProducts',getProducts);
//router.get('/product/fetchcategories',fetchCategories);
