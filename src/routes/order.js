const { requireLogin, middleware } = require("../Validators/validation");
const { addOrder, getOrders, getOrder } = require("../controller/order");
const router = require("express").Router();

router.post("/addOrder", requireLogin, addOrder);
router.get("/getOrders", requireLogin, getOrders);
router.post("/getOrder", requireLogin, getOrder);

module.exports = router;
