const { requireLogin, middleware } = require("../Validators/validation");
const {
  addOrder,
  getOrders,
  getOrder,
  deleteOrders,
  updateOrder,
  updateOrderStatus,
} = require("../controller/order");
const router = require("express").Router();

router.post("/addOrder", requireLogin, addOrder);
router.get("/getOrders", requireLogin, getOrders);
router.post("/getOrder", requireLogin, getOrder);
router.put("/order/details", requireLogin, updateOrder);
router.put("/order/status", requireLogin, updateOrderStatus);
//TEMP
router.delete("/order", requireLogin, deleteOrders);

module.exports = router;
