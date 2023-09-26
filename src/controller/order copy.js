const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Teams = require("../models/teams");

exports.addOrder1 = async (req, res) => {
  try {
    // 1) Extract data from parameters
    const { addressId, paymentType, notes } = req.body;
    const user = req.user;
    let teamBuy = req.query.teamBuy ? req.query.teamBuy : false;
    let args = {};
    let teamExpired = false;

    // 2) Check if user entered all fields
    if (!addressId || !paymentType) {
      return res.status(400).json({ type: "Error", message: "fieldsRequired" });
    }
    // 3) Get user cart
    const userCart = await Cart.findOne({ user: user._id });
    // 4) Check if cart doesn't exist
    if (!userCart || userCart.cartItems.length === 0) {
      return res.status(404).json({ type: "Error", message: "noCartFound" });
    }
    // 5) Check if order is slash deal or team buy or regular buy
    //      1) If SlashDeal, create order
    //         If Team buy and team exists, validate the team ID
    //          If valid team, check if the team condition meets
    //            If it meets, Update order status to completed
    //            If not, update order status to pending
    //        If Team buy and team not exist,
    //            Create team, and update order status to pending
    //       If Not Team buy
    //            Update the order status to completed.
    //
    let totalPrice = userCart.finalCartTotal;
    const usedWalletAmount = req.body.usedWalletAmount;
    //If wallet money is used, reduce it from the total amount to be paid.
    if (usedWalletAmount && usedWalletAmount > 0) {
      totalPrice = totalPrice - usedWalletAmount;
    }
    // 6) Check payment method
    if (paymentType === "card") {
      // 5) If payment method is card then extract card data from body
      const { wallet, cardNumber, expMonth, expYear, cvc } = req.body;

      // 6) Check if user entered card data
      if (!cardNumber || !expMonth || !expYear || !cvc) {
        return res
          .status(400)
          .json({ type: "Error", message: "fieldsRequired" });
      }

      // 7) Create stripe card token
      const token = { id: "xxx" }; //TO DO: replace with payment gateway token
      /*
  await stripe.tokens.create({
    card: {
      number: cardNumber,
      exp_month: expMonth,
      exp_year: expYear,
      cvc
    }
  });
  */

      // 8) Create stripe charge
      const charge = { id: "yyy", source: token.id }; //TO DO: replace with payment gateway charge method
      /*stripe.charges.create({
    amount: Math.round(cart.totalPrice),
    currency: 'usd',
    source: token.id,
    description: 'Charge For Products'
  });*/
    }

    // 9) if payment is success and wallet money is used, reduce wiseCoins.
    //TO DO:
    //If wallet money is used, reduce it from the total amount to be paid.
    if (usedWalletAmount && usedWalletAmount > 0 && charge != null) {
      const updateUser = await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { wiseCoins: -wiseCoins } }
      );
    }

    //If team buy and team exist, Validate the team ID
    if (
      userCart.cartItems[i].teamBuy &&
      userCart.cartItems[i].team &&
      userCart.cartItems[i].team !== null
    ) {
      const referenceId = userCart.cartItems[i].team;
      const isTeamValid = await Teams.findById(referenceId);
      if (!isTeamValid) {
        return res
          .status(404)
          .json({ type: "Error", message: "Team is not valid" });
      }
      //TO DO:
      //If valid team, check if the team condition meets
      //If it meets, Update order status to completed
      //If not, update order status to pending
      if (isTeamValid.type == "Buy") {
        /*TO DO: Move the logic to cart -start
        const alreadyMember = isTeamValid.members.findIndex(
          (x) => x == req.user._id
        );
        if (alreadyMember > -1) {
          teamBuy = "false";
        } else {
          args = {
            $push: {
              members: req.user._id,
            },
          };
        }

        if (createdAt < Date.now() - 24 * 60 * 60 * 1000) {
          args = { status: "Cancelled" };
          teamExpired = "true";
        }
        if (teamBuy == "true" && isTeamValid.currentRequired < 1) {
          teamBuy = "false";
        }
        TO DO: Move the logic to cart -end*/
        if (isTeamValid.currentRequired < 2) {
          const updatedTeam = await Teams.findByIdAndUpdate(
            referenceID,
            { status: "Closed", $inc: { currentRequired: -1 } },
            { new: true }
          ).exec();
        } else {
          const updatedTeam1 = await Teams.findByIdAndUpdate(
            referenceID,
            { $inc: { currentRequired: -1 } },
            { new: true }
          ).exec();
        }
      }
    }
    //If team buy and team not exist, Create the team and update order status to pending
    else if (
      userCart.cartItems[i].teamBuy &&
      (!userCart.cartItems[i].team || userCart.cartItems[i].team == null)
    ) {
      const discountType = userCart.cartItems[i].discountType;
      let totalRequired;
      if (discountType == "View") {
        totalRequired = userCart.cartItems[i].needToView;
      } else if (discountType == "Register") {
        totalRequired = userCart.cartItems[i].needToRegister;
      } else {
        totalRequired = userCart.cartItems[i].needToBuy;
      }
      userCart.cartItems[i].team = await Teams.create({
        owner: req.user._id,
        type: discountType,
        totalRequired: totalRequired,
        currentRequired: totalRequired,
      });
    }
    //If SlashDeal, create order
    else if (
      userCart.cartItems[i].priceChop &&
      userCart.cartItems[i].priceChop != null
    ) {
      const updateChop = await PriceChop.findByIdAndUpdate(
        id,
        { status: "Cancelled" },
        { new: true }
      ).exec();
      orderObj.priceChop = userCart.cartItems[i].priceChop;
    }

    // 7) If payment method is cash the create new order for the cash method
    const order = await Order.create({
      products: cart.items,
      user: user._id,
      totalPrice: totalPrice,
      shippingAddress,
      paymentMethod,
      phone,
    });
    //      1) Update product sold and quantity fields
    //      2) Delete cart
    //      3) Remove user discount code
    //      4) If everything is OK, send data

    // 8) If payment method is card then extract card data from body
    //      1) Check if user entered card data
    //      2) Create stripe card token
    //      3) Create stripe charge
    //      4) Create order with payment method card

    // 9) Update product sold and quantity fields
    // 10) Delete cart
    // 11) Remove user discount code
    // 12) If everything is OK, send data
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.addOrder2 = async (req, res) => {
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

    /* 
If Order payment information is missing or cart not exist, send error
Check if CouponApplied is exist
If not exist, Update the order details with the cart details 
If exist, TO DO

If SlashDeal, create order
If Team buy and team exists, validate the team ID
  If valid team, check if the team condition meets
    If it meets, Update order status to completed
    If not, update order status to pending
If Team buy and team not exist,
    Create team, and update order status to pending
If Not Team buy
    Update the order status to completed.
    */

    //Validate mandactory parameters to create order
    if (
      req.body.addressId == null &&
      req.body.paymentType == null &&
      req.body.paymentStatus != "completed"
    ) {
      return res.status(400).json({ message: "MIssing payment information" });
    }

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
          console.log("isTeamValid    " + isTeamValid);
        }

        //If team buy and team not exist, Create the team
        else if (
          userCart.cartItems[i].teamBuy &&
          (!userCart.cartItems[i].team || userCart.cartItems[i].team == null)
        ) {
          const discountType = userCart.cartItems[i].discountType;
          let totalRequired;
          if (discountType == "View") {
            totalRequired = userCart.cartItems[i].needToView;
          } else if (discountType == "Register") {
            totalRequired = userCart.cartItems[i].needToRegister;
          } else {
            totalRequired = userCart.cartItems[i].needToBuy;
          }
          let teamObj = new Teams({
            owner: req.user._id,
            type: discountType,
            totalRequired: totalRequired,
            currentRequired: totalRequired,
          });
          userCart.cartItems[i].team = await teamObj.save();
        }

        //If slash deal, update the order price to slash price, and cancel the priceChop
        else if (
          userCart.cartItems[i].priceChop &&
          userCart.cartItems[i].priceChop != null
        ) {
          const updateChop = await PriceChop.findByIdAndUpdate(
            id,
            { status: "Cancelled" },
            { new: true }
          ).exec();
          orderObj.priceChop = userCart.cartItems[i].priceChop;
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

exports.updateOrder1 = async (req, res) => {
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

exports.updateOrderStatus1 = async (req, res) => {
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

exports.addOrder3 = (req, res) => {
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

exports.getOrders1 = (req, res) => {
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

exports.deleteOrders1 = (req, res) => {
  Order.deleteMany({ user: req.user._id }).exec((error, orders) => {
    if (error) return res.status(400).json({ error });
    if (orders) {
      res.status(200).json({ orders });
    }
  });
};

exports.getOrder1 = (req, res) => {
  try {
    Order.findOne({ _id: req.body.orderId })
      .populate("items.product", "_id name productImages")
      .populate({
        path: "team",
        //select: ["_id", "members"],
        populate: [{ path: "members", select: ["username"] }],
      })
      .exec((error, order) => {
        if (error) return res.status(400).json({ error });
        if (order) {
          Address.findOne({
            user: req.user._id,
            // _id: order.addressId,
          }).exec((error, address) => {
            if (error) return res.status(400).json({ error });
            order.address = address.address.find(
              (adr) => adr._id.toString() == order.addressId.toString()
            );
            res.status(200).json({
              order,
            });
          });
        }
      });
  } catch (error) {
    console.log("getOrder " + error.message);
    res.status(500).json({
      type: "Error",
      message: "Something went wrong",
    });
  }
};
