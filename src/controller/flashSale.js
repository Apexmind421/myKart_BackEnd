const FlashSale = require("../models/flashSale");
const Product = require("../models/product");
const slugify = require("slugify");
//const validateMongoDbId = require("../Validators/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

exports.getAllFlashSales = async (req, res) => {
  try {
    const flashSale = await FlashSale.find({
      status: 1,
      //  start_date: { $lt: new Date() },
      //  end_date: { $gt: new Date() },
    }).select(
      "_id title slug featured background_color text_color banner end_date"
    );

    if (flashSale) {
      return res.status(200).json({
        success: true,
        message: "fetched flash Sales",
        data: flashSale,
        size: flashSale.length,
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
exports.addFlashSale = async (req, res) => {
  try {
    if (req.body.title && req.body.start_date && req.body.end_date) {
      const flashSaleObj = {
        title: req.body.title,
        slug: slugify(req.body.title),
        status: req.body.status,
        featured: req.body.featured,
        background_color: req.body.background_color,
        text_color: req.body.text_color,
        banner: req.body.banner,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
      };

      if (req.file) {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const newpath = await uploader(req.file.path);
        flashSaleObj.banner = newpath.url;
      }

      const _flashSale = await FlashSale.create(flashSaleObj);

      if (_flashSale) {
        return res.status(201).json({
          success: true,
          message: "added flashSale",
          data: _flashSale,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not create user address" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const flashSaleObj = req.body;
      if (req.file) {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const newpath = await uploader(req.file.path);
        flashSaleObj.banner = newpath.url;
      }
      const _flashsale = await FlashSale.findByIdAndUpdate(id, flashSaleObj, {
        new: true,
      });
      if (_flashsale) {
        return res
          .status(202)
          .json({ success: true, message: "updated sucessfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not update flash sale" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.deleteFlashSale = (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const clearProductFlashSale = Product.updateMany(
        { flashSale: id },
        { $set: { flashSale: null } }
      );

      const deleteFalshSale = FlashSale.findByIdAndDelete(id);

      Promise.all([clearProductFlashSale, deleteFalshSale])
        .then((result) => {
          return res
            .status(202)
            .json({ success: true, message: "Flashsale removed" });
        })
        .catch((error) =>
          res
            .status(400)
            .json({ success: false, message: "Could not delete flashsale" })
        );
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.deleteAllFlashSales = (req, res) => {
  try {
    const clearProductFlashSale = Product.updateMany(
      {},
      { $set: { flashSale: null } }
    );
    const deleteFalshSale = FlashSale.deleteMany();
    Promise.all([clearProductFlashSale, deleteFalshSale])
      .then((result) => {
        return res
          .status(202)
          .json({ success: true, message: "Flashsales removed" });
      })
      .catch((error) =>
        res
          .status(400)
          .json({ success: false, message: "Could not delete flashsale" })
      );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.getFlashSaleProducts = async (req, res) => {
  try {
    const findArgs = {
      //  featured: 1,
      status: 1,
      start_date: { $lt: new Date() },
      end_date: { $gt: new Date() },
    };
    if (req.query.id) {
      findArgs._id = req.query.id;
    }
    const flashSale = await FlashSale.findOne(findArgs)
      .sort({ featured: 1 })
      .select("_id");

    if (flashSale) {
      const flashSaleItems = await Product.find({
        flashSale: flashSale._id,
      }).select("_id name productImages price rating");
      if (flashSaleItems) {
        return res.status(200).json({
          success: true,
          message: "fetched flash sale items",
          data: flashSaleItems,
          size: flashSaleItems.length,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "no flash sale items",
          data: [],
        });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No Featured flashsale" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
