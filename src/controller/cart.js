const Cart = require("../models/cart");
const Product = require("../models/product");

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

exports.addItemToCart2 = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      console.log("Cart from Req is " + JSON.stringify(req.body));
      //Added on 26-12-2020
      //let totalPrice = cart.totalPrice ? cart.totalPrice : 0;
      //let totalItems = cart.numberOfItems ? cart.numberOfItems : 0;
      for (const i in req.body.cartItems) {
        // console.log("Item price is " + req.body.cartItems[i].price);

        const productIndex = cart.cartItems.findIndex(
          (_cart) => _cart.product == req.body.cartItems[i].product
        );
        if (productIndex > -1) {
          console.log("I am in If1" + cart.cartItems[productIndex]);
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
          return res.status(201).json({
            cart: _cart,
          });
        }
      });
    } else {
      //if cart not exist then create a new cart
      console.log("I am here 01");
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });

      console.log("XXX " + JSON.stringify(cart));
      cart.save((error, _cart) => {
        if (error) return res.status(400).json({ error });
        if (_cart) return res.status(201).json({ cart });
      });
    }
  });
};

exports.removeItemFromCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      const productIndex = cart.cartItems.findIndex(
        (_cart) => _cart.product == req.query.productId
      );
      console.log("productIndex " + productIndex);
      if (productIndex > -1) {
        cart.cartItems.splice(productIndex, 1);
      }

      cart.save((error, _cart) => {
        if (error) {
          res.status(400).json({
            message: "Something went wrong",
          });
        }

        if (_cart) {
          return res.status(201).json({
            cart: _cart,
          });
        }
      });
    }
  });
};

exports.DisplayItemsInCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    console.log("I am inside1");
    if (error) return res.status(400).json({ error });
    if (cart) {
      console.log("I am inside2");
      return res.status(200).json({ cart });
    } else {
      return res.status(202).json({});
    }
  });
};

exports.getCartItems = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  Cart.findOne({ user: req.user._id })
    .populate("cartItems.product", "_id name price productImages")
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        let cartItems = {};
        cart.cartItems.forEach((item, index) => {
          cartItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productImages[0].img,
            price: item.product.price,
            qty: item.quantity,
          };
        });
        res.status(200).json({ cartItems });
      }
    });
  //}
};
