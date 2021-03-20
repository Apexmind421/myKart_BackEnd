const Favorite = require("../models/favorite");
const Product = require("../models/product");

exports.addItemToWishList = (req, res) => {
  //Favorite.findOne({ _id: req.query.wishlistid }).exec((error, favorite) => {
  Favorite.findOne({ user: req.user._id }).exec((error, favorite) => {
    if (error) return res.status(400).json({ error });
    if (favorite) {
      if (req.body.title) {
        favorite.title = req.body.title;
      }
      if (req.body.favoriteItems.length > 0) {
        console.log("favorite from Req is " + JSON.stringify(req.body));
        for (const i in req.body.favoriteItems) {
          const productIndex = favorite.favoriteItems.findIndex(
            (_favorite) =>
              _favorite.product == req.body.favoriteItems[i].product
          );

          if (productIndex > -1) {
            let productItem = favorite.favoriteItems[productIndex];
            favorite.favoriteItems[productIndex] = productItem;
          } else {
            favorite.favoriteItems.push(req.body.favoriteItems[i]);
          }
        }
      }
      favorite.save((error, _favorite) => {
        if (error) {
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
        if (_favorite) {
          return res.status(201).json({
            favorite: _favorite,
          });
        }
      });
    } else {
      //if favorite not exist then create a new favorite
      console.log("I am here 01");
      const favorite = new Favorite({
        user: req.user._id,
        title: req.body.title,
        favoriteItems: req.body.favoriteItems,
      });

      console.log("XXX " + JSON.stringify(favorite));
      favorite.save((error, _favorite) => {
        if (error) return res.status(400).json({ error });
        if (_favorite) return res.status(201).json({ favorite });
      });
    }
  });
};

exports.removeItemFromWishList = (req, res) => {
  Favorite.findOne({ _id: req.query.id }).exec((error, favorite) => {
    if (error) return res.status(400).json({ error });
    if (favorite) {
      const productIndex = favorite.favoriteItems.findIndex(
        (_favorite) => _favorite.product == req.query.productId
      );
      console.log("productIndex " + productIndex);
      if (productIndex > -1) {
        favorite.favoriteItems.splice(productIndex, 1);
      }

      favorite.save((error, _favorite) => {
        if (error) {
          res.status(400).json({
            message: "Something went wrong",
          });
        }

        if (_favorite) {
          return res.status(201).json({
            favorite: _favorite,
          });
        }
      });
    }
  });
};

exports.deleteWishListById = (req, res) => {
  const wishlistId = req.query.wishlistId;
  //console.log("WishList ID is " + wishlistId);
  if (wishlistId) {
    console.log("WishList ID is " + wishlistId);
    Favorite.findOneAndDelete({ _id: wishlistId }).exec((error, result) => {
      if (error || !result) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ message: "WishList deleted sucessfully" });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.fetchWishList = (req, res) => {
  Favorite.find({ user: req.user._id })
    .populate(
      "favoriteItems.product"
      // , "_id name price description productImages"
    )
    .exec((err, result) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(result);
    });
};
