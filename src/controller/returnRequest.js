const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const Cart = require("../models/cart");
const Address = require("../models/address");
const ReturnRequests = require("../models/returnRequests");
const { cloudinaryUploadImg } = require("../utils/cloudinary");

exports.createReturnRequest = async (req, res) => {
  try {
    let returnRequestObj = {};
    //Mandactory Fields are seller_id,order_id,return_reason
    returnRequestObj.user_id = req.user._id;
    returnRequestObj.seller_id = req.body.seller_id;
    returnRequestObj.return_reason = req.body.return_reason;
    returnRequestObj.product_id = req.body.product_id
      ? req.body.product_id
      : "";
    returnRequestObj.variant_id = req.body.variant_id
      ? req.body.variant_id
      : "";
    returnRequestObj.remarks = req.body.remarks ? req.body.remarks : "";
    //Attachments
    const imageUpload = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await imageUpload(path);
      console.log(newpath);
      urls.push(newpath.url);
    }
    returnRequestObj.attachments = urls;
    //Validate Order_id and check if order is delivered in last 7 days.
    const foundOrder = await Order.findOne({
      _id: req.body.order_id,
      delivery_date: { $gt: new Date() - 7 * 24 * 60 * 60 * 1000 },
    });
    if (!foundOrder) {
      return res
        .status(400)
        .json({ success:false, message: "Invalid Order ID" });
    }
    returnRequestObj.order_id = foundOrder._id;

    //Check if there is already return request exist for the order.
    const foundReturnRequest = await ReturnRequests.findOne({
      order_id: req.body.order_id,
    });

    if (foundReturnRequest) {
      return res
        .status(400)
        .json({ success:false, message: "Return Request already exist" });
    }

    //TO DO: Check how many return requests that user created in last 30 days.

    const returnOrderRequest = await ReturnRequests.create(returnRequestObj);
    if (returnOrderRequest) {
      return res.status(201).json({
       success:true,
        mesage: "Return Request Created",
        returnOrderRequest,
      });
    } else {
      return res
        .status(400)
        .json({ success:false, message: "Could not create Return Request" });
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      mesage: "Something went wrong",
      error: error.message,
    });
  }
};

exports.updateReturnRequest = async (req, res) => {
  try {
    let initiateReturn = false;
    let updatedReturnOrderObj = {};
    const { id } = req.query;
    if (req.body.seller_approval) {
      //TO DO: Check if the seller is the one who is updating the seller approval
      if (req.body.seller_approval == false) {
        updatedReturnOrderObj.status = "Rejected";
      }
      updatedReturnOrderObj.seller_approval = req.body.seller_approval;
    }
    //If admin approves or rejects, update the return order
    if (req.body.admin_approval) {
      //TO DO: If return request is alredy rejected, then do nothing
      updatedReturnOrderObj.admin_approval = req.body.admin_approval;
      if (req.body.admin_approval == true) {
        //TO DO: Take the refund amount from the order price.
        if (req.body.type == "Replacement") {
          /* Update orderstatus to return_initiated
         const updatedOrder = await Order.findByIdAndUpdate(
            order,
            updatedReturnOrderObj,
            { new: true }
          );*/
        } else if (req.body.type == "Refund") {
          if (!req.body.refund_amount) {
            return res
              .status(400)
              .json({ success:false, message: "Missing Refund Amount" });
          }
          updatedReturnOrderObj.refund_amount = req.body.refund_amount;
        }
        updatedReturnOrderObj.status = "Approved";
        updatedReturnOrderObj.type = req.body.type;
        initiateReturn = true;
      } else {
        if (!req.body.reject_reason) {
          return res
            .status(400)
            .json({ success:false, message: "Missing Reject Reason" });
        }
        updatedReturnOrderObj.status = "Rejected";
        updatedReturnOrderObj.reject_reason = req.body.reject_reason;
      }
    }

    const updatedReturnOrder = await ReturnRequests.findByIdAndUpdate(
      id,
      updatedReturnOrderObj,
      { new: true }
    );
    if (updatedReturnOrder) {
      if (initiateReturn) {
        //Update order status to return initiated
        await Order.findByIdAndUpdate(updatedReturnOrder.order_id, {
          $push: {
            orderStatus: {
              type: "returnInitiated",
            },
          },
        }).exec();
      }
      return res.status(201).json({
       success:true,
        mesage: "Return Order Updated",
        updatedReturnOrder,
      });
    } else {
      return res
        .status(400)
        .json({ success:false, message: "Could not update Return order" });
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      mesage: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getAllReturnRequests = async (req, res) => {
  try {
    //Set Filter Conditions
    let findArgs = {};

    if (req.body.status) {
      findArgs = { ...findArgs, status: req.body.status };
    }
    if (req.body.admin_approval) {
      findArgs = { ...findArgs, admin_approval: req.body.admin_approval };
    }
    if (req.body.seller_approval) {
      findArgs = { ...findArgs, seller_approval: req.body.seller_approval };
    }
    if (req.body.return_reason) {
      findArgs = { ...findArgs, return_reason: req.body.return_reason };
    }

    //Set Sortting
    const sortOrder =
      req.query.sortOrder && req.query.sortOrder === "latest"
        ? { createdAt: 1 }
        : { _id: -1 };

    //Set Skip and Limit
    const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const returnOrders = await ReturnRequests.find(findArgs)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    if (returnOrders) {
      res.status(200).json({ returnOrders });
    } else {
      return res.status(400).json({ error });
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      mesage: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    //Set Filter Conditions
    let findArgs = { user_id: req.user._id };

    if (req.body.status) {
      findArgs = { ...findArgs, status: req.body.status };
    }
    if (req.body.admin_approval) {
      findArgs = { ...findArgs, admin_approval: req.body.admin_approval };
    }
    if (req.body.seller_approval) {
      findArgs = { ...findArgs, seller_approval: req.body.seller_approval };
    }
    if (req.body.return_reason) {
      findArgs = { ...findArgs, return_reason: req.body.return_reason };
    }

    //Set Sortting
    const sortOrder =
      req.query.sortOrder && req.query.sortOrder === "latest"
        ? { createdAt: 1 }
        : { _id: -1 };

    //Set Skip and Limit
    const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const returnOrders = await ReturnRequests.find(findArgs)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    if (returnOrders) {
      return res.status(200).json({ returnOrders });
    } else {
      return res.status(400).json({ error });
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      mesage: "Something went wrong",
      error: error.message,
    });
  }
};
