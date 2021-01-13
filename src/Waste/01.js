import express from 'express';
import Product from '../models/productModel';
import { isAuth, isAdmin } from '../util';

const router = express.Router();

router.get('/', async (req, res) => {
  const category = req.query.category ? { category: req.query.category } : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: 'i',
        },
      }
    : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === 'lowest'
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };
  const products = await Product.find({ ...category, ...searchKeyword }).sort(
    sortOrder
  );
  res.send(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found.' });
  }
});
router.post('/:id/reviews', isAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const review = {
      name: req.body.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      message: 'Review saved successfully.',
    });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
router.put('/:id', isAuth, isAdmin, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.price = req.body.price;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.category = req.body.category;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    const updatedProduct = await product.save();
    if (updatedProduct) {
      return res
        .status(200)
        .send({ message: 'Product Updated', data: updatedProduct });
    }
  }
  return res.status(500).send({ message: ' Error in Updating Product.' });
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  const deletedProduct = await Product.findById(req.params.id);
  if (deletedProduct) {
    await deletedProduct.remove();
    res.send({ message: 'Product Deleted' });
  } else {
    res.send('Error in Deletion.');
  }
});

router.post('/', isAuth, isAdmin, async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });
  const newProduct = await product.save();
  if (newProduct) {
    return res
      .status(201)
      .send({ message: 'New Product Created', data: newProduct });
  }
  return res.status(500).send({ message: ' Error in Creating Product.' });
});

export default router;




const { cartItems } = req.body;



  const cartObj = {

    user: req.user._id,

    cartItems: [cartItems],

  };



  Carts.findOne({ user: req.user._id }, (error, cart) => {

    if (error) {

      return res.status(400).json({ error });

    }



    if (cart) {
      const productIndex = cart.cartItems.findIndex(
        (_cart) => _cart.product == req.body.cartItems.product
      );
      if (productIndex > -1) {
        let productItem = cart.cartItems[productIndex];
        productItem.quantity = cartItems.quantity;
        productItem.price = cartItems.price;
        cart.cartItems[productIndex] = productItem;
      } else {
        cart.cartItems.push(cartItems);
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
      Carts.create(cartObj)
        .then(
          (cart) => {
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(cart);
            console.log("Cart Created");
          },
          (err) => res.status(401).json(err)
        )
        .catch((err) => res.status(401).json(err));
    }
  });

  
exports.addItemToCart = (req, res) => {

  Cart.findOne({ user: req.user._id })
  .exec((error, cart) => {
      if(error) return res.status(400).json({ error });
      if(cart){
          //if cart already exists then update cart by quantity
          console.log("I am here 03");
          console.log("XXX "+req.body.cartItems.product);
          const product = req.body.cartItems.product;
          const item = cart.cartItems.findIndex(c => c.product == product);
          console.log("I am outside "+item);
          let condition, update;
          if(item){
              console.log("I am inside if");
              condition = { "user": req.user._id, "cartItems.product": product };
              update = {
                  "$set": {
                      "cartItems.$": {
                          ...req.body.cartItems,
                          quantity: item.quantity + req.body.cartItems.quantity
                      }
                  }
              }; 
          }else{
              console.log("I am inside else");
              condition = { user: req.user._id };
              update = {
                  "$push": {
                      "cartItems": req.body.cartItems
                  }
              };
          }
          Cart.findOneAndUpdate(condition, update)
          .exec((error, _cart) => {
              if(error) return res.status(400).json({ error });
              if(_cart){
                  return res.status(201).json({ cart: _cart });
              }
          })
      }else{
          //if cart not exist then create a new cart
          console.log("I am here 01");
          const cart = new Cart({
              user: req.user._id,
              cartItems: [req.body.cartItems]
          });
          console.log("XXX"+req.body.cartItems);
          cart.save((error, cart) => {
              if(error) return res.status(400).json({ error });
              if(cart){
                  return res.status(201).json({ cart });
              }
          });
      } 
  });
};
