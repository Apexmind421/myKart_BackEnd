const Cart = require("../models/cart");
const Product = require("../models/product");
const validateMongoDbId = require("../Validators/validateMongodbId");
const Coupon = require("../models/coupon");

exports.userCart = async (req, res) => {
  //if team buy is true, take originalprice and discountprice,
  //or else take only originalprice
  const { cart } = req.body;
  const { _id } = req.user;
  //validateMongoDbId(_id);
  try {
    let cartItems = [];
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ user: _id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    //Set cartItems
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i].product;
      object.quantity = cart[i].quantity;
      let getPrice = await Product.findById(cart[i].product)
        .select(
          "price shippingCost tax discount discount_type need_to_buy need_to_View need_to_Register"
        )
        .exec();
      if (cart[i].teamBuy) {
        object.price =
          getPrice.discount && getPrice.discount > 0
            ? getPrice.price - (getPrice.price * getPrice.discount) / 100
            : getPrice.price;
        object.discount_type = getPrice.discount_type
          ? getPrice.discount_type
          : "Buy";
        object.need_to_buy = getPrice.need_to_buy;
        object.need_to_View = getPrice.need_to_View;
        object.need_to_Register = getPrice.need_to_Register;
        object.teamBuy = cart[i].teamBuy;
        object.team = cart[i].team;
      } else {
        object.price = getPrice.price;
      }
      object.shippingCost = getPrice.shippingCost;
      object.tax = getPrice.tax;
      cartItems.push(object);
    }

    //Set CartTotal, ShippingCostTotal, Tax Total
    let cartTotal = 0;
    let shippingCostTotal = 0;
    let taxTotal = 0;
    for (let i = 0; i < cartItems.length; i++) {
      cartTotal = cartTotal + cartItems[i].price * cartItems[i].quantity;
      if (cartItems[i].shippingCost)
        shippingCostTotal = shippingCostTotal + cartItems[i].shippingCost;
      if (cartItems[i].tax)
        taxTotal = taxTotal + cartItems[i].tax * cartItems[i].quantity;
    }
    //Create Cart
    let newCart = await new Cart({
      cartItems,
      cartTotal,
      shippingCostTotal,
      taxTotal,
      user: _id,
    }).save();
    return res.status(200).json({ cart: newCart._id });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { cartId, coupon } = req.query;
    const { _id } = req.user;
    // validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({
      code: coupon.trim(),
      isActive: true,
      start_date: { $lt: new Date() },
      end_date: { $gt: new Date() },
    }).select("isPercent discount");

    if (validCoupon === null) {
      return res.status(400).json({ error: "Invalid Coupon" });
    }

    let { cartTotal } = await Cart.findOne({
      _id: cartId,
    });
    let totalAfterDiscount = cartTotal;
    if (validCoupon.isPercent) {
      totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
      ).toFixed(2);
    } else {
      totalAfterDiscount = cartTotal - validCoupon.discount;
    }

    await Cart.findOneAndUpdate(
      { user: _id },
      { totalAfterDiscount, couponApplied: validCoupon._id },
      { new: true }
    );
    return res.status(200).json({ totalAfterDiscount: totalAfterDiscount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    //you update code here

    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
}

exports.addItemToCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      //if cart already exists then update cart by quantity
      let promiseArray = [];

      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;
        const item = cart.cartItems.find((c) => c.product == product);
        let condition, update;
        if (item) {
          condition = { user: req.user._id, "cartItems.product": product };
          update = {
            $set: {
              "cartItems.$": cartItem,
            },
          };
        } else {
          condition = { user: req.user._id };
          update = {
            $push: {
              cartItems: cartItem,
            },
          };
        }
        promiseArray.push(runUpdate(condition, update));
      });
      Promise.all(promiseArray)
        .then((response) => res.status(201).json({ response }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      //if cart not exist then create a new cart
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });
      cart.save((error, cart) => {
        if (error) return res.status(400).json({ error });
        if (cart) {
          return res.status(201).json({ cart });
        }
      });
    }
  });
};

exports.addItemToCart2 = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      for (const i in req.body.cartItems) {
        const productIndex = cart.cartItems.findIndex(
          (_cart) => _cart.product == req.body.cartItems[i].product
        );
        if (productIndex > -1) {
          let productItem = cart.cartItems[productIndex];
          productItem.quantity = req.body.cartItems[i].quantity;
          cart.cartItems[productIndex] = productItem;
        } else {
          cart.cartItems.push(req.body.cartItems[i]);
        }
      }

      cart.save((error, _cart) => {
        if (error) {
          res.status(400).json({
            message: "Something went wrong",
          });
        }

        if (_cart) {
          _cart
            .populate("cartItems.product", "_id name price productImages")
            .execPopulate((e, newcart) => {
              return res.status(201).json({
                cart: newcart,
              });
            });
          /* return res.status(201).json({
            cart: _cart,
          });*/
        }
      });
    } else {
      //if cart not exist then create a new cart
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });
      cart.save((error, _cart) => {
        if (error) return res.status(400).json({ error });
        if (_cart) {
          _cart
            .populate("cartItems.product", "_id name price productImages")
            .execPopulate((e, newcart) => {
              return res.status(201).json({
                cart: newcart,
              });
            });
          //return res.status(201).json({ cart });
        }
      });
    }
  });
};

exports.removeItemFromCart = (req, res) => {
  console.log("Isdfhsdjkhfjkdshf");
  Cart.findOne({ user: req.user._id }).exec((error, cart1) => {
    if (error) return res.status(400).json({ error });
    if (cart1) {
      const productIndex = cart1.cartItems.findIndex(
        (_cart) => _cart.product == req.query.productId
      );
      console.log("productIndex " + productIndex);
      if (productIndex > -1) {
        cart1.cartItems.splice(productIndex, 1);
      }

      cart1.save((error, _cart) => {
        if (error) {
          res.status(400).json({
            message: "Something went wrong",
          });
        }

        if (_cart) {
          _cart
            .populate("cartItems.product", "_id name price productImages")
            .execPopulate((e, newcart) => {
              return res.status(201).json({
                cart: newcart,
              });
            });
          //  return res.status(201).json({
          //   cart: _cart,
          // });
        }
      });
    }
  });
};

exports.DisplayItemsInCart = (req, res) => {
  Cart.findOne({ user: req.user._id })
    .populate("cartItems.product", "_id name price productImages")
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        return res.status(200).json({ cart });
      } else {
        return res.status(202).json({});
      }
    });
};

exports.getCartItems = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  Cart.find({ user: req.user._id })
    .populate("cartItems.product", "_id name price productImages")
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        /*  let cartItems = {};
        cart.cartItems.forEach((item, index) => {
          cartItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productImages[0].img,
            price: item.product.price,
            qty: item.quantity,
          };
        }); */
        res.status(200).json({ cart });
      }
    });
  //}
};

exports.deleteCart = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  Cart.deleteMany({ user: req.user._id }).exec((error, cart) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (cart) {
      return res.status(200).json({ message: "cart deleted" });
    }
  });
};

// new update remove cart items
exports.removeCartItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Cart.updateone(
      { user: req.user._id },
      {
        $pull: {
          cartItems: {
            product: productId,
          },
        },
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};

/*
exports.addItemToCart1 = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      //if cart already exists then update cart by quantity
      console.log("I am here 03");
      console.log("XXX " + req.body.cartItems.product);
      const product = req.body.cartItems.product;
      const item = cart.cartItems.find((c) => c.product == product);
      console.log("I am outside " + item);
      let condition, update;
      if (item) {
        console.log("I am inside if");
        condition = { user: req.user._id, "cartItems.product": product };
        update = {
          $set: {
            "cartItems.$": {
              ...req.body.cartItems,
              quantity: item.quantity + req.body.cartItems.quantity,
            },
          },
        };
      } else {
        console.log("I am inside else");
        condition = { user: req.user._id };
        update = {
          $push: {
            cartItems: req.body.cartItems,
          },
        };
      }
      Cart.findOneAndUpdate(condition, update).exec((error, _cart) => {
        if (error) return res.status(400).json({ error });
        if (_cart) {
          return res.status(201).json({ cart: _cart });
        }
      });
    } else {
      //if cart not exist then create a new cart
      console.log("I am here 01");
      const cart = new Cart({
        user: req.user._id,
        cartItems: [req.body.cartItems],
      });
      console.log("XXX" + req.body.cartItems);
      cart.save((error, cart) => {
        if (error) return res.status(400).json({ error });
        if (cart) {
          return res.status(201).json({ cart });
        }
      });
    }
  });
};
*/
