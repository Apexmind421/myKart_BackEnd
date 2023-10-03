const Favorite = require("../models/favorite");
const Product = require("../models/product");

exports.updateToWishList = async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.query;
  const { title } = req.query;
  try {
    let updateWishlist = {};
    const findArgs = title ? { user: _id, title: title } : { user: _id };
    const wishlist = await Favorite.findOne(findArgs);
    if (wishlist) {
      const alreadyadded = wishlist.favoriteItems.find(
        (id) => id.toString() === prodId
      );
      //If product is already exist in wishlist than remove
      //otherwise add it.
      if (alreadyadded) {
        updateWishlist = await Favorite.findByIdAndUpdate(
          wishlist._id,
          {
            $pull: { favoriteItems: prodId },
          },
          {
            new: true,
          }
        );
      } else {
        updateWishlist = await Favorite.findByIdAndUpdate(
          wishlist._id,
          {
            $push: { favoriteItems: prodId },
          },
          {
            new: true,
          }
        );
      }
    } //if wish list is not exist then create it
    else {
      let favoriteItems = [];
      favoriteItems.push(prodId);
      const favorite = {
        user: _id,
        title: title,
        favoriteItems: favoriteItems,
      };
      updateWishlist = await Favorite.create(favorite);
    }
    return res.status(200).json({
      success: true,
      message: "favorite list updated",
      data: updateWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.deleteWishListById = async (req, res) => {
  try {
    const wishlistId = req.query.wishlistId;
    //console.log("WishList ID is " + wishlistId);
    if (!wishlistId) {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
    const result = await Favorite.findByIdAndDelete(wishlistId);
    if (result) {
      res
        .status(202)
        .json({ success: true, message: "WishList deleted sucessfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not delete wishlist" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.fetchWishList = async (req, res) => {
  try {
    const result = await Favorite.find({ user: req.user._id }).populate({
      path: "favoriteItems",
      select: ["name", "price", "productImages"],
    });
    if (result) {
      return res.status(200).json({
        success: true,
        message: "fetched wishlist",
        data: result,
      });
    } else {
      return res
        .status(204)
        .json({ success: true, message: "No result found", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.fetchAllWishlistProducts = async (req, res) => {
  try {
    const wishlistItems = await Favorite.aggregate([
      {
        $match: {},
      },
      { $unset: ["_id", "user", "title", "createdAt", "updatedAt", "__v"] },
      { $unwind: "$favoriteItems" },
      {
        $group: {
          _id: "$favoriteItems",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: -1 } },
    ]);
    if (wishlistItems) {
      return res.status(200).json({
        success: true,
        message: "fetched wishlist Items",
        data: wishlistItems,
        size: wishlistItems.length,
      });
    } else {
      return res
        .status(204)
        .json({ success: true, message: "No result found", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/*
exports.addItemToWishList1 = (req, res) => {
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
  //Favorite.findOne({ _id: req.query.id }).exec((error, favorite) => {
  Favorite.findOne({ user: req.user._id }).exec((error, favorite) => {
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
          return res.status(200).json({
            favorite: _favorite,
          });
        }
      });
    }
  });
};*/
