const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Teams = require("../models/teams");

exports.addOrder = async (req, res) => {
  try {
    // 1) Extract data from parameters
    const { addressId, paymentType, notes } = req.body;
    const user = req.user;
    let teamBuy = req.query.teamBuy ? req.query.teamBuy : false;
    let teamExpired = false;
    let team;
    let isPaid = false;
    let paymentId;
    let updateOtherOrders = false;
    let paymentStatus = "pending";
    let orderStatus = "pending";
    const wiseCoins = req.body.wiseCoins ? req.body.wiseCoins : 0;

    // 2) Check if user entered all fields
    if (!addressId || !paymentType) {
      return res.status(400).json({ success:false, message: "fieldsRequired" });
    }

    //Validate if address is correct.
    const addressFound = await Address.findOne({
      user: req.user._id,
    });
    const correctAddress = addressFound.address.find(
      (adr) => adr._id.toString() == addressId.toString()
    );
    if (correctAddress == undefined) {
      return res.status(400).json({ success:false, message: "addressInvalid" });
    }

    // 3) Get user cart
    const userCart = await Cart.findOne({ user: user._id });

    // 4) Check if cart doesn't exist
    if (!userCart || userCart.cartItems.length === 0) {
      return res.status(404).json({ success:false, message: "noCartFound" });
    }

    // 5) Check if order is slash deal or team buy or regular buy
    let totalPrice = userCart.finalCartTotal;
    const couponApplied = userCart.couponApplied;
    const coupon_code = userCart.coupon_code;

    //If wiseCoins are used, reduce it from the total amount to be paid.
    if (wiseCoins && wiseCoins > 0) {
      totalPrice = totalPrice - wiseCoins;
    }

    // 6) Check payment method
    if (paymentType === "card") {
      // 5) If payment method is card then extract card data from body
      const { cardNumber, expMonth, expYear, cvc } = req.body;

      // 6) Check if user entered card data
      if (!cardNumber || !expMonth || !expYear || !cvc) {
        return res
          .status(400)
          .json({ success:false, message: "fieldsRequired" });
      }

      // 7) TO DO: Create PAYMENT GATEWAY card token
      const token = {
        id: "xxx",
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
      };

      // 8) TO DO: Create PAYMENT GATEWAY charge
      const charge = {
        id: "yyy",
        amount: Math.round(totalPrice),
        currency: "usd",
        source: token.id,
        description: "Charge For Products",
      };

      // 9) if payment is success and wiseCoins are used, reduce wise coins.
      //TO DO:
      //If wiseCoins are used, reduce it from the total amount to be paid.
      if (wiseCoins && wiseCoins > 0 && charge != null) {
        const updateUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $inc: { wiseCoins: -wiseCoins } }
        );
      }

      if (charge && charge.id != null) {
        paymentId = charge.id;
        isPaid = true;
        paymentStatus = "completed";
      }
    }

    //If Pyament completed, check if the team buy or not
    if (isPaid) {
      for (let i = 0; i < userCart.cartItems.length; i++) {
        //If team buy
        if (userCart.cartItems[i].teamBuy) {
          //If team exist
          if (
            userCart.cartItems[i].team &&
            userCart.cartItems[i].team !== null
          ) {
            const referenceId = userCart.cartItems[i].team;
            const isTeamValid = await Teams.findById(referenceId);

            if (
              !isTeamValid ||
              isTeamValid.currentRequired < 1 ||
              isTeamValid.status != "Open"
            ) {
              return res
                .status(404)
                .json({ success:false, message: "Team is not valid" });
            }
            //if it is a teambuy of type Buy, check the team condition
            if (isTeamValid.type == "Buy") {
              let args = {
                $push: {
                  members: req.user._id,
                },
              };

              team = referenceId;

              //If team consition met, close the team, set this order and all the orders to confirmed.
              if (isTeamValid.currentRequired < 2) {
                args = { ...args, status: "Closed" };
                const updatedTeam = await Teams.findByIdAndUpdate(
                  referenceId,
                  { ...args, $inc: { currentRequired: -1 } },
                  { new: true }
                ).exec();
                updateOtherOrders = true;
              }

              //If team condition does not met, update the team member count
              else {
                const updatedTeam1 = await Teams.findByIdAndUpdate(
                  referenceID,
                  { ...args, $inc: { currentRequired: -1 } },
                  { new: true }
                ).exec();
              }
            }
          }
          //If team not exist, create the team
          else {
            const discountType = userCart.cartItems[i].discountType;
            let totalRequired;
            if (discountType == "View") {
              totalRequired = userCart.cartItems[i].needToView;
            } else if (discountType == "Register") {
              totalRequired = userCart.cartItems[i].needToRegister;
            } else if (discountType == "Slash") {
              totalRequired = userCart.cartItems[i].needToSlash;
            } else {
              totalRequired = userCart.cartItems[i].needToBuy;
            }
            const members = [req.user._id];
            userCart.cartItems[i].team = await Teams.create({
              owner: req.user._id,
              product: userCart.cartItems[i].product,
              type: discountType,
              totalRequired: totalRequired,
              currentRequired: totalRequired - 1,
              members: members,
            });

            team = userCart.cartItems[i].team;
          }
        }
        //If not team buy, complete order status
        else {
          orderStatus = "confirmed";
        }
      }
    }

    // 7) If payment method is cash the create new order for the cash method
    const order = await Order.create({
      items: userCart.cartItems,
      user: user._id,
      totalAmount: userCart.finalCartTotal,
      taxPrice: userCart.taxTotal,
      shippingPrice: userCart.shippingCostTotal,
      paymentType,
      addressId,
      isPaid,
      paymentId,
      paidAt: new Date(),
      paymentStatus,
      notes,
      usedWiseCoins: wiseCoins,
      couponApplied,
      coupon_code,
      orderStatus: [{ type: orderStatus }],
      team,
    });
    if (order) {
      //Query orders table where items team is matched with referenceID
      if (updateOtherOrders) {
        orderStatus = {
          type: "confirmed",
        };
        const filter = {
          // items: { $elemMatch: { team: referenceID } },
          team: team,
          isPaid: true,
        };
        const updateDoc = { $push: { orderStatus: orderStatus } };
        const updatePendingOrders = await Order.updateMany(
          filter,
          updateDoc
        ).exec();
      }
      //TO DO: Update Variant logic
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
      /*let updateVariant = userCart.cartItems.map((item) => {
        if (item.variant) {
          return {
            updateOne: {  
              filter: { _id: item.variant },
              update: {
                $inc: { quantity: -item.quantity },
              },
            },
          };
        } else {
          return;
        }
      });*/

      for (y in userCart.cartItems) {
        if (userCart.cartItems[y].variant) {
          const filter1 = { _id: userCart.cartItems[y].variant };
          const updateDoc1 = {
            $inc: { quantity: -userCart.cartItems[y].quantity },
          };
          ProductVariant.findByIdAndUpdate(filter1, updateDoc1, {
            new: true,
          }).exec(); //findOneAndUpdate
        }
      }
      const updated = Product.bulkWrite(update, {});
      const deleteCart = Cart.deleteOne({ _id: userCart._id }).exec();
      //.exec((error, cart) => {
      // if (error)
      // return res.status(400).json({ message: "Could not show order" });
      return res
        .status(201)
        .json({success:true, mesage: "Order Created", order });
      //  });
    } else {
      return res
        .status(400)
        .json({ success:false, message: "Could not create order" });
    }
  } catch (error) {
    console.log("Catch Error for addOrder is::: " + error.message);
    return res
      .status(500)
      .json({ success:false, mesage: "Something went wrong" });
  }
};

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
    const { id } = req.query;
    const order_status = req.query.orderStatus;
    let updateDoc = {
      $push: {
        orderStatus: {
          type: order_status,
        },
      },
    };

    //TO DO: Send Notfications to customer on order status updates
    //TO DO: check the state rules
    if (order_status == "shipped") {
      if (!req.body.tracking_code || !req.body.courier_agency) {
        return res
          .status(400)
          .json({ success:false, message: "Missing Tracking Code" });
      }
      updateDoc = {
        ...updateDoc,
        tracking_code: req.body.tracking_code,
        courier_agency: req.body.courier_agency,
        tracking_url: req.body.tracking_url ? req.body.tracking_url : null,
      };
    } else if (order_status == "delivered") {
      updateDoc = {
        ...updateDoc,
        delivery_date: req.body.delivery_date
          ? req.body.delivery_date
          : new Date(),
        isActive: false,
      };
    }

    const updateOrderStatus = await Order.findByIdAndUpdate(id, updateDoc, {
      new: true,
    });

    if (updateOrderStatus) {
      return res
        .status(201)
        .json({success:true, mesage: "Order Updated", updateOrderStatus });
    } else {
      return res.status(400).json({
        success:false,
        message: "Could not update order",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success:false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getOrders = (req, res) => {
  //Set Filter Conditions
  let findArgs = { user: req.user._id };
  if (req.body.isActive) {
    findArgs = { ...findArgs, isActive: req.body.isActive };
  }
  if (req.body.createdAfter) {
    findArgs = { ...findArgs, createdAt: { $gt: req.body.createdAfter } };
  }
  if (req.body.createdBefore) {
    findArgs = { ...findArgs, createdAt: { $lt: req.body.createdBefore } };
  }

  //Set Sortting
  const sortOrder =
    req.query.sortOrder && req.query.sortOrder === "latest"
      ? { createdAt: 1 }
      : { _id: -1 };

  //Set Skip and Limit
  const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;

  Order.find(findArgs)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error });
      if (orders) {
        res.status(200).json({ orders });
      }
    });
};

//To DO: To be moved to Admin order file
exports.getAllOrders = (req, res) => {
  //Set Filter Conditions
  let findArgs = {};
  const { isActive, createdAfter, createdBefore } = req.body.search;
  if (isComplete) {
    findArgs = { ...findArgs, isActive: isActive };
  }
  if (createdAfter) {
    findArgs = { ...findArgs, createdAt: { $gt: createdAfter } };
  }
  if (createdBefore) {
    findArgs = { ...findArgs, createdAt: { $lt: createdBefore } };
  }

  //Set Sortting
  const sortOrder =
    req.query.sortOrder && req.query.sortOrder === "latest"
      ? { createdAt: 1 }
      : { _id: -1 };

  //Set Skip and Limit
  const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  Order.find(findArgs)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
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

exports.getOrderDetails = (req, res) => {
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
      success:false,
      message: "Something went wrong",
    });
  }
};
