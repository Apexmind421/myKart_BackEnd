const Order = require("../models/order");
const Cart = require("../models/cart");
const Address = require("../models/address");

/*
const totalOrderAmount = (items) => {
  let cartWithPrice = [];
  items.forEach((cartItem) => {
    cartWithPrice.push({
      productId: cartItem.product._id,
      payablePrice: cartItem.product.price,
      purchasedQty: cartItem.quantity,
    });
  });
  const cartTotal = cartWithPrice?.reduce(
    (amount, item) => item.payablePrice * item.purchasedQty + amount,
    0
  );
};
*/

exports.addOrder = (req, res) => {
  const orderStatus = [
    {
      type: "ordered",
      date: new Date(),
      isCompleted: true,
    },
    {
      type: "packed",
      isCompleted: false,
    },
    {
      type: "shipped",
      isCompleted: false,
    },
    {
      type: "delivered",
      isCompleted: false,
    },
  ];

  const order = new Order({
    user: req.user._id,
    totalAmount: req.body.totalAmount,
    addressId: req.body.addressId,
    items: req.body.items,
    paymentType: req.body.paymentType,
    paymentStatus: req.body.paymentStatus,
    orderStatus: orderStatus,
  });

  order.save((error, order) => {
    if (error) return res.status(400).json({ error });
    if (order) {
      Cart.deleteOne({ user: req.user._id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(201).json({ order });
        }
      });
    }
  });
};

exports.getOrders = (req, res) => {
  Order.find({ user: req.user._id })
    .select("_id paymentStatus paymentType orderStatus addressId")
    //  .populate(
    //     { path: "items.productId", select: "_id name productImages" },
    //{ path: "addressId", select: "_id name address" }
    // )
    //.populate("addressId")
    // .populate({ path: "addressId" })
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error });
      if (orders) {
        res.status(200).json({ orders });
      }
    });
};

exports.getOrder = (req, res) => {
  console.log("Token isssssssssss " + JSON.stringify(req.body));
  Order.findOne({ _id: req.body.orderId })
    .populate("items.productId", "_id name productImages")
    .lean()
    .exec((error, order) => {
      if (error) return res.status(400).json({ error });
      if (order) {
        Address.findOne({
          user: req.user._id,
          //_id: order.addressId,
        }).exec((error, address) => {
          if (error) return res.status(400).json({ error });
          order.address = address.address.find(
            (adr) => adr._id.toString() == order.addressId.toString()
          );

          res.status(200).json({
            order,
            //orderAddress,
          });
        });
      }
    });
};
