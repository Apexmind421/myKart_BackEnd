const { requireLogin, middleware } = require("../Validators/validation");
const {
  createReturnRequest,
  updateReturnRequest,
  getReturnRequests,
  getAllReturnRequests,
} = require("../controller/returnRequest");
const router = require("express").Router();

router.post("/return-request/add", requireLogin, createReturnRequest);
router.get("/return-request/fetch", requireLogin, getReturnRequests);
//TEMP
//router.delete("/order", requireLogin, deleteOrders);
//ADMIN API
router.get(
  "/admin/return-request/fetch",
  requireLogin,
  middleware,
  getAllReturnRequests
);
router.put(
  "/return-request/update",
  requireLogin,
  middleware,
  updateReturnRequest
);

module.exports = router;
