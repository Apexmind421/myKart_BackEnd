const Tickets = require("../models/tickets");
const { cloudinaryUploadImg } = require("../utils/cloudinary");

exports.addTicket = async (req, res) => {
  try {
    let ticketObj = req.body;
    ticketObj.customer_id = req.user._id;
    ticketObj.updated_by = req.user._id;

    const imageUpload = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await imageUpload(path);
      console.log(newpath);
      urls.push(newpath.url);
      //fs.unlinkSync(path);
    }
    ticketObj.attachments = urls;

    const _ticket = new Tickets(ticketObj);
    _ticket.save((error, ticket) => {
      //console.log("I am here in the category save");
      if (error) return res.status(400).json({ error });
      if (ticket) {
        return res.status(201).json({
          success: true,
          message: "created ticket",
          data: ticket,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    if (ticketId) {
      const ticketObj = req.body;
      ticketObj.updated_by = req.user._id;
      if (req.body.status && req.body.status == "completed") {
        ticketObj.isActive = false;
      }
      const updatedTicket = await Tickets.findByIdAndUpdate(
        ticketId,
        ticketObj
      );
      if (updatedTicket) {
        return res.status(200).json({
          success: true,
          message: "updated ticket",
          data: updatedTicket,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not update ticket" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//exports.addAnswer = (req, res) => {};

exports.addTicketMessage = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    if (ticketId) {
      let ticket_messages = {
        message: req.body.message,
        messaged_by: req.user._id,
      };
      if (req.file) {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const newpath = await uploader(req.file.path);
        ticket_messages.attachments = newpath.url;
      }

      const updatedTicket = await Tickets.findByIdAndUpdate(ticketId, {
        $push: {
          ticket_messages,
        },
      });
      if (updatedTicket) {
        return res.status(200).json({
          success: true,
          message: "updated ticket",
          data: updatedTicket,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not update ticket" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const args = req.user.role == "admin" ? {} : { customer_id: req.user._id };
    const showAll = req.query.showAll ? req.query.showAll : false;
    let findArgs = { args };
    if (showAll) {
      findArgs = args;
    } else {
      findArgs = { ...args, isActive: true };
    }
    const tickets = await Tickets.find(findArgs).select("type subject status");
    if (tickets) {
      return res.status(200).json({
        success: true,
        message: "fetched tickets",
        data: tickets,
      });
    } else {
      return res
        .status(204)
        .json({ success: true, message: "No result found", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//TEMP
exports.getTicketDetails = async (req, res) => {
  try {
    if (req.query.ticketId) {
      const tickets = await Tickets.findById(req.query.ticketId);

      if (tickets) {
        return res.status(200).json({
          success: true,
          message: "fetched ticket details",
          data: tickets,
        });
      } else {
        return res
          .status(204)
          .json({ success: true, message: "No result found", data: [] });
      }
    } else {
      return res.status(400).json({ message: "Missing ticket Id" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
