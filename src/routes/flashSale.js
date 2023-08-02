const express = require("express");
const router = express.Router();
const {
  addFlashSale,
  getFlashSaleProducts,
  getAllFlashSales,
  updateFlashSale,
  updateFlashSaleImage,
  deleteFlashSale,
  deleteAllFlashSales,
} = require("../controller/flashSale");
const {
  flashSaleImgResize,
  uploadImage,
} = require("../middlewares/uploadImage");
const { requireLogin, middleware } = require("../Validators/validation");

router.get("/flashsale_products", getFlashSaleProducts);
router.get("/flashsale", getAllFlashSales);
router.post(
  "/flashsale",
  requireLogin,
  uploadImage.single("banner"),
  //flashSaleImgResize,
  addFlashSale
);
router.put(
  "/flashsale/:id",
  requireLogin,
  uploadImage.single("banner"),
  //flashSaleImgResize,
  updateFlashSale
);
router.delete("/flashsale/:id", requireLogin, deleteFlashSale);
//TEMP
router.delete("/flashsale_all", requireLogin, deleteAllFlashSales);
module.exports = router;
