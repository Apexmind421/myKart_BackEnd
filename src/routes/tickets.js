const express = require("express");
const router = express.Router();
const {
  addTicket,
  updateTicket,
  addTicketMessage,
  getTickets,
  getTicketDetails,
} = require("../controller/tickets");
const { requireLogin, middleware } = require("../Validators/validation");
const {
  flashSaleImgResize,
  uploadImage,
} = require("../middlewares/uploadImage");

router.post(
  "/ticket",
  requireLogin,
  uploadImage.array("ticketImages", 3),
  addTicket
);
router.put("/ticket", requireLogin, updateTicket);
router.post(
  "/ticket-message",
  requireLogin,
  uploadImage.single("ticketImage"),
  addTicketMessage
);
router.get("/tickets/all", requireLogin, getTickets);
router.get("/ticket/details", requireLogin, getTicketDetails);
module.exports = router;
