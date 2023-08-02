const Tickets = require("../models/tickets");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

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
      if (ticket) return res.status(201).json({ ticket });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    if (ticketId) {
      const ticketObj = req.body;
      ticketObj.updated_by = req.user._id;
      const _updateProduct = await Tickets.findByIdAndUpdate(
        ticketId,
        ticketObj,
        {
          new: true,
        }
      );
      res.status(200).json(_updateProduct);
    } else {
      return res.status(400).json({ message: "Missing inputs" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//exports.addAnswer = (req, res) => {};

exports.addTicketMessage = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    let ticket_messages = {
      message: req.body.message,
      messaged_by: req.user._id,
    };
    if (req.file) {
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      const newpath = await uploader(req.file.path);
      ticket_messages.attachments = newpath.url;
    }

    const postMessage = await Tickets.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          ticket_messages,
        },
      },
      {
        new: true,
      }
    );
    return res.status(201).json({ postMessage });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getTickets = (req, res) => {
  const args = req.user.role == "admin" ? {} : { customer_id: req.user._id };
  console.log("args " + JSON.stringify(args));
  Tickets.find(args)
    .select("type subject status")
    .exec((error, tickets) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (tickets) {
        res.status(200).json({ tickets });
      }
    });
};

//TEMP
exports.getTicketDetails = (req, res) => {
  try {
    if (req.query.ticketId) {
      Tickets.findOne({ _id: req.query.ticketId }).exec((error, tickets) => {
        if (error)
          return res.status(400).json({
            error,
          });
        if (tickets) {
          res.status(200).json({ tickets });
        }
      });
    } else {
      return res.status(400).json({ message: "Missing ticket Id" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
