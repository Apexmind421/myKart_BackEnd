const Cart = require("../models/cart");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
//const validateMongoDbId = require("../Validators/validateMongodbId");
const Coupon = require("../models/coupon");
/* 
  1. Check if the cart is exist, if exist delete the old one.
  2. Set cart items. ie. to fetch the product details like quanity and price
  3. Validate if the quanity exists
  4. Check if reference ID exisits, if yes, update the cart
  5. Check if team buy. if yes, save team ID(if exist), needToView, needToBuy, discountedPrice*/
//if team buy is true, take originalprice and discountprice,
//or else take only originalprice
exports.userCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;

  try {
    //Set CartTotal, ShippingCostTotal, Tax Total,cartItems
    let cartItems = [];
    let cartTotal = 0;
    let shippingCostTotal = 0;
    let taxTotal = 0;
    let finalCartTotal = 0;

    //If no cart send error
    if (!cart) {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
    // check if user already have product in cart, if yes, then delete cart
    const alreadyExistCart = await Cart.findOne({ user: _id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    //Set cartItems
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i].product;
      object.quantity = cart[i].quantity;
      let getPrice;
      //If Variant exist then getPrice from variant other wise from product
      if (cart[i].variant) {
        getPrice = await ProductVariant.findById(cart[i].variant)
          .select("price teamPrice quantity shippingCost  discount")
          .populate({
            path: "product",
            select: "_id tax discountType needToBuy needToView needToRegister",
          })
          .exec();
        object.tax = getPrice.product.tax;
        object.variant = cart[i].variant;
      } else {
        //Get product details
        getPrice = await Product.findById(cart[i].product)
          .select(
            "price teamPrice quantity shippingCost tax discount discountType needToBuy needToView needToRegister"
          )
          .exec();
        object.tax = getPrice.tax;
      }
      //Validate if product quantity is enough.
      if (getPrice && getPrice.quantity < cart[i].quantity) {
        return res.status(400).json({
          success: false,
          message: "Selected product quanity is not be available",
        });
      }

      // Set Object in case order is for teambuy
      if (cart[i].teamBuy && cart[i].teamBuy == "true") {
        object.price =
          getPrice.discount && getPrice.discount > 0
            ? getPrice.teamPrice -
              (getPrice.teamPrice * getPrice.discount) / 100
            : getPrice.teamPrice;
        object.discount = getPrice.discount;
        if (cart[i].variant) {
          object.discountType = getPrice.product.discountType
            ? getPrice.product.discountType
            : "Buy";
          object.needToBuy = getPrice.product.needToBuy;
          object.needToView = getPrice.product.needToView;
          object.needToRegister = getPrice.product.needToRegister;
          object.needToSlash = getPrice.product.needToSlash;
        } else {
          object.discountType = getPrice.discountType
            ? getPrice.discountType
            : "Buy";
          object.needToBuy = getPrice.needToBuy;
          object.needToView = getPrice.needToView;
          object.needToRegister = getPrice.needToRegister;
          object.needToSlash = getPrice.needToSlash;
        }
        object.teamBuy = cart[i].teamBuy;
        object.team = cart[i].team;
      }
      //Set object in case order is for pricechop
      else if (cart[i].priceChop && cart[i].priceChop != null) {
        //validate the priceChop record, if valid take the priceChop discount value
        const validatePriceChops = await PriceChop.findById({ id }).select(
          "status owner createdAt"
        );
        if (
          validatePriceChops &&
          validatePriceChops.status == "Closed" &&
          validatePriceChops.owner == req.user._id &&
          validatePriceChops.createdAt > Date.now() - 24 * 60 * 60 * 1000
        ) {
          object.price = 0;
        }
      }
      //Set object in case order is a regular buy
      else {
        object.price =
          getPrice.discount && getPrice.discount > 0
            ? getPrice.price - (getPrice.price * getPrice.discount) / 100
            : getPrice.price;
        object.discount = getPrice.discount;
      }

      object.shippingCost = getPrice.shippingCost;

      cartItems.push(object);
    }

    for (let i = 0; i < cartItems.length; i++) {
      cartTotal = cartTotal + cartItems[i].price * cartItems[i].quantity;
      if (cartItems[i].shippingCost)
        shippingCostTotal = shippingCostTotal + cartItems[i].shippingCost;
      if (cartItems[i].tax)
        taxTotal =
          taxTotal +
          (cartItems[i].tax * cartItems[i].quantity * cartItems[i].price) / 100;
      cartTotal += taxTotal;
    }
    finalCartTotal = cartTotal + shippingCostTotal;

    //Create Cart
    let newCart = await new Cart({
      cartItems,
      cartTotal,
      shippingCostTotal,
      taxTotal,
      finalCartTotal,
      user: _id,
    }).save();

    if (newCart) {
      return res.status(201).json({
        success: true,
        message: "cart created successfuylly",
        data: newCart,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not create user cart" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    //Set Variables
    const { cartId, coupon } = req.query;
    const { _id } = req.user;
    //Set finalCartTotal based on discount
    let cartTotalAfterCuponDiscount = 0.0;
    let finalCartTotal = 0.0;
    let couponDiscount = 0.0;

    //Check if coupon code is valid
    const validCoupon = await Coupon.findOne({
      code: coupon.trim(),
      isActive: true,
      start_date: { $lt: new Date() },
      end_date: { $gt: new Date() },
    }).select("isPercent discount type min_buy max_discount products");

    if (validCoupon === null) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon" });
    }

    //Get cart total using cart ID.
    let { cartItems, cartTotal, couponApplied, shippingCostTotal } =
      await Cart.findOne({
        _id: cartId,
      });

    if (!cartTotal) {
      return res.status(400).json({ success: false, message: "Invalid Cart" });
    }

    //If coupon type is total
    if (validCoupon.type == "total") {
      //If coupon type is total, send error if min_buy has not been met
      if (cartTotal - validCoupon.min_buy <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cart total is less than minimum required amount " +
            validCoupon.min_buy,
        });
      }
      //If cart total is greater than the max_discount, set it to cart coupon discount
      if (couponDiscount - validCoupon.max_discount > 0) {
        couponDiscount = validCoupon.max_discount;
      }
    } else if (validCoupon.type == "product") {
      //if coupon type is product, find if cart has the  product which is matching with coupon products
      //TO DO: Expand to all the cart products, for now, only match first cart item product
      const cartProduct = cartItems[0].product.find(
        (x) => x == validCoupon.products
      );
      if (!cartProduct) {
        return res.status(400).json({
          success: false,
          message: "Coupon can not be used on this product",
        });
      }
    }

    if (validCoupon.isPercent) {
      couponDiscount = (cartTotal * validCoupon.discount) / 100;
    } else {
      couponDiscount = validCoupon.discount;
    }

    cartTotalAfterCuponDiscount = cartTotal - couponDiscount;
    finalCartTotal = (
      parseFloat(cartTotalAfterCuponDiscount) + parseFloat(shippingCostTotal)
    ).toFixed(2);

    //Update Cart with coupon code.
    const updateCartWithCoupon = await Cart.findOneAndUpdate(
      { user: _id },
      {
        couponDiscount,
        finalCartTotal: finalCartTotal,
        couponApplied: true,
        coupon_code: validCoupon._id,
      }
    );
    if (updateCartWithCoupon) {
      return res.status(200).json({
        success: true,
        message: "Coupon Code applied",
        data: finalCartTotal,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not apply coupon to cart" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
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

exports.addItemToCart2 = async (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      for (const i in req.body.cartItems) {
        const validateProductQuanity = false;
        Product.findOne({
          _id: req.body.cartItems[i],
        })
          .select("_id quanity")
          .exec((err, quantity) => {
            validateProductQuanity = true;
          });
        console.log("I am here 001 " + validateProductQuanity);
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
