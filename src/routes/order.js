const { requireLogin, middleware } = require("../Validators/validation");
const {
  addOrder,
  getOrders,
  getAllOrders,
  getOrderDetails,
  deleteOrders,
  updateOrder,
  updateOrderStatus,
} = require("../controller/order");
const router = require("express").Router();

router.post("/addOrder", requireLogin, addOrder);
router.get("/getOrders", requireLogin, getOrders);
router.post("/getOrder", requireLogin, getOrderDetails);
router.put("/order/details", requireLogin, updateOrder);
//TEMP
router.delete("/order", requireLogin, deleteOrders);
//ADMIN API
router.get("/admin/getOrders", requireLogin, middleware, getAllOrders);
router.put("/order/status", requireLogin, middleware, updateOrderStatus);

module.exports = router;
