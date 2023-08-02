const Favorite = require("../models/favorite");
const Product = require("../models/product");

exports.updateToWishList = async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.query;
  const { title } = req.query;
  try {
    const args = title ? { user: _id, title: title } : { user: _id };
    const wishlist = await Favorite.findOne(args);
    if (wishlist) {
      const alreadyadded = wishlist.favoriteItems.find(
        (id) => id.toString() === prodId
      );
      if (alreadyadded) {
        let _favorite = await Favorite.findByIdAndUpdate(
          wishlist._id,
          {
            $pull: { favoriteItems: prodId },
          },
          {
            new: true,
          }
        );
        return res.status(201).json({
          favorite: _favorite,
        });
      } else {
        let _favorite = await Favorite.findByIdAndUpdate(
          wishlist._id,
          {
            $push: { favoriteItems: prodId },
          },
          {
            new: true,
          }
        );
        return res.status(201).json({
          favorite: _favorite,
        });
      }
    } else {
      let favoriteItems = [];
      favoriteItems.push(prodId);
      console.log("I am here 01" + JSON.stringify(favoriteItems));
      const favorite = {
        user: _id,
        title: title,
        favoriteItems: favoriteItems,
      };

      console.log("XXX " + JSON.stringify(favorite));
      const _favorite = await Favorite.create(favorite);
      return res.status(201).json({ favorite: _favorite });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

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
    .populate({
      path: "favoriteItems",
      select: ["name", "price", "productImages"],
    })
    .exec((err, result) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(result);
    });
};

exports.fetchAllWishlistProducts = (req, res) => {
  Favorite.aggregate([
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
    /*  {
      $lookup: {
        from: Product.collection.name,
        localField: "favoriteItems",
        foreignField: "_id",
        as: "prod",
      },
    },
    {
      $group: {
        _id: "$prod.name",
        count: { $sum: 1 },
      },
    },*/

    // Sort by year descending
    { $sort: { count: -1, _id: -1 } },
  ])
    //.find()
    /*
    .distinct("favoriteItems")
    .populate({
      path: "favoriteItems",
      select: ["name", "price", "productImages"],
    })*/
    .exec((err, data) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send({ size: data.length, data });
    });
};
