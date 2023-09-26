const FlashSale = require("../models/flashSale");
const Product = require("../models/product");
const slugify = require("slugify");
//const validateMongoDbId = require("../Validators/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

exports.getAllFlashSales = (req, res) => {
  FlashSale.find({
    status: 1,
    //  start_date: { $lt: new Date() },
    //  end_date: { $gt: new Date() },
  })
    .select(
      "_id title slug featured background_color text_color banner end_date"
    )
    .exec((error, flashSale) => {
      if (error) return res.status(400).json({ error });
      if (flashSale) {
        res.status(200).json({ count: flashSale.length, flashSale });
      }
    });
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
      res.status(201).json(_flashSale);
    } else {
      res.status(400).json({ error: "missing required inputs" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    // throw new Error(error);
  }
};
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    //validateMongoDbId(id);
    const flashSaleObj = req.body;
    if (req.file) {
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      const newpath = await uploader(req.file.path);
      console.log("xxx" + JSON.stringify(newpath));
      flashSaleObj.banner = newpath.url;
    }
    /* FlashSale.findByIdAndUpdate(id, flashSaleObj, {
      new: true,
    }).exec((error, flashSale) => {
      if (error) return res.status(400).json({ error });
      if (flashSale) {
        res.status(200).json({ flashSale });
      }
    });*/
    const _flashsale = await FlashSale.findByIdAndUpdate(id, flashSaleObj, {
      new: true,
    });
    res.status(200).json(_flashsale);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    //validateMongoDbId(id);
    const removeFlashSale = await Product.updateMany(
      { flashSale: id },
      { $set: { flashSale: null } }
    );
    FlashSale.findOneAndDelete({ _id: id }).exec((error, flashSale) => {
      if (error) return res.status(400).json({ error });
      if (flashSale) {
        res.status(202).json({ message: "Flashsale removed" });
      }
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.deleteAllFlashSales = async (req, res) => {
  const removeFlashSale = await Product.updateMany(
    {},
    { $set: { flashSale: null } }
  );
  FlashSale.deleteMany().exec((error, result) => {
    if (error) return res.status(400).json({ error });
    if (result) {
      res.status(202).json({ result });
    }
  });
};

exports.getFlashSaleProducts = (req, res) => {
  try {
    /* Product.find({ flashSale: { $ne: null } });
  Product.aggregate([
    { $match: { flashSale: { $ne: null } } },
    {
      $group: {
        _id: "$flashSale+",
        products: { $push: "$$ROOT" },
      },
    },
  ])
    //distinct("flashSale").
    //.select("_id name flashSale")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Tags are not found" + err,
        });
      }

      res.json({
        size: data.length,
        data,
      });
    });*/
    const findArgs = {
      //  featured: 1,
      status: 1,
      start_date: { $lt: new Date() },
      end_date: { $gt: new Date() },
    };
    if (req.query.id) {
      findArgs._id = req.query.id;
    }
    FlashSale.findOne(findArgs)
      .sort({ featured: 1 })
      .select("_id")
      .exec((error, flashSale) => {
        if (error) return res.status(400).json({ error });
        if (flashSale) {
          Product.find({ flashSale: flashSale._id })
            .select("_id name productImages price rating")
            .exec((error, products) => {
              if (error) {
                return res.status(400).json({ error });
              }
              res.status(200).json({ "flashSale items": products });
            });
        } else {
          return res.status(400).json({ message: "No Featured flashsale" });
        }
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
