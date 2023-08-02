const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Teams = require("../models/teams");

exports.addOrder = async (req, res) => {
  try {
    //Type: team buy or normal buy
    //User
    //Product ID
    //Variant ID
    //Quantity
    //Coupon Applied
    //Address ID
    //Payment ID
    //Payment Method
    //Payment Status
    //Team ID
    //Notes

    let orderObj = new Order({
      user: req.user._id,
      addressId: req.body.addressId,
      paymentId: req.body.paymentId,
      paymentType: req.body.paymentType,
      paymentStatus: req.body.paymentStatus,
      notes: req.body.notes,
    });

    let userCart = await Cart.findOne({ user: req.user._id });
    if (userCart) {
      if (userCart.couponApplied !== null && userCart.totalAfterDiscount) {
        orderObj.totalAmount =
          userCart.totalAfterDiscount +
          userCart.shippingCostTotal +
          userCart.taxTotal;
        orderObj.couponApplied = userCart.couponApplied;
      } else {
        orderObj.totalAmount =
          userCart.cartTotal + userCart.shippingCostTotal + userCart.taxTotal;
      }
      orderObj.originalPrice = userCart.cartTotal;
      orderObj.taxPrice = userCart.taxTotal;
      orderObj.shippingPrice = userCart.shippingCostTotal;

      for (let i = 0; i < userCart.cartItems.length; i++) {
        //If team buy and team exist, Validate the team ID
        if (
          userCart.cartItems[i].teamBuy &&
          userCart.cartItems[i].team &&
          userCart.cartItems[i].team !== null
        ) {
          const isTeamValid = await Teams.findById(userCart.cartItems[i].team);
          if (!isTeamValid) {
            return res.status(400).json({ message: "Team is not valid" });
          }
        }
        //If team buy and team not exist, Create the team
        else if (
          userCart.cartItems[i].teamBuy &&
          (!userCart.cartItems[i].team || userCart.cartItems[i].team == null)
        ) {
          let teamObj = new Teams({
            owner: req.user._id,
            type: userCart.cartItems[i].discount_type,
            totalRequired: userCart.cartItems[i].need_to_buy,
            currentRequired: userCart.cartItems[i].need_to_buy,
          });
          userCart.cartItems[i].team = await teamObj.save();
        }
      }
      orderObj.items = userCart.cartItems;
      orderObj.save((error, order) => {
        if (error) return res.status(400).json({ error });
        if (order) {
          let update = userCart.cartItems.map((item) => {
            return {
              updateOne: {
                filter: { _id: item.product },
                update: {
                  $inc: { quantity: -item.quantity, sold: +item.quantity },
                },
              },
            };
          });
          const updated = Product.bulkWrite(update, {});
          const deleteCart = Cart.deleteOne({ _id: userCart._id }).exec();
          //.exec((error, cart) => {
          // if (error)
          // return res.status(400).json({ message: "Could not show order" });
          return res.status(201).json({ order: order._id });
          //  });
        } else {
          return res.status(400).json({ message: "Could not create order" });
        }
      });
    } else {
      return res.status(400).json({ message: "Could not find cart" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

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

exports.updateOrder = async (req, res) => {
  try {
    let updatedOrderObj = req.body;

    const { id } = req.query;
    //validateMongoDbId(id);
    if (updatedOrderObj.orderStatus) {
      updatedOrderObj.orderStatus.date = new Date();
    }
    console.log("Update Obj " + JSON.stringify(updatedOrderObj));
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      updatedOrderObj,
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    let updatedStatus = {
      orderStatus: {
        type: req.body.orderStatus,
      },
    };

    const { id } = req.query;

    console.log("Update Obj " + JSON.stringify(updatedStatus));
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        $push: updatedStatus,
      },

      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.addOrder1 = (req, res) => {
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
    //.select("_id paymentStatus paymentType orderStatus addressId")
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

exports.deleteOrders = (req, res) => {
  Order.deleteMany({ user: req.user._id }).exec((error, orders) => {
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
