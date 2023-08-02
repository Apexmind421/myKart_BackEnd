const Product = require("../models/product");
//const Reviews = require("../models/productReviews");
const Category = require("../models/category");
const ProductVariantOption = require("../models/productVariantOption");
const ProductVariant = require("../models/productVariant");
const User = require("../models/user");
const slugify = require("slugify");
const shortid = require("shortid");
const { json } = require("express");
//const {_doMultipleUpload} = require('../Validators/validation');
const DataUri = require("datauri");
const DatauriParser = require("datauri/parser");
const path = require("path");
const parser = new DatauriParser();
const { uploader } = require("../config/cloudinary.config");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");
const validateMongoDbId = require("../Validators/validateMongodbId");

exports.addProductReview = async (req, res) => {
  try {
    //console.log("product ID is " + req.user._id);
    const productId = req.query.id;
    if (productId) {
      const product = await Product.findOne({ _id: productId });
      if (product) {
        /*   let today = new Date();
          var dd = String(today.getDate()).padStart(2, "0");
          var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
          var yyyy = today.getFullYear();
          today = mm + "/" + dd + "/" + yyyy; */

        const review = {
          name: req.user._id,
          rating: Number(req.body.rating),
          comment: req.body.comment,
          review_date: new Date(),
        };

        const imageUpload = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
          const { path } = file;
          const newpath = await imageUpload(path);
          console.log(newpath);
          urls.push(newpath.url);
          //fs.unlinkSync(path);
        }
        review.images = urls;
        const reviewIndex = product.reviews.findIndex(
          (userId) => userId.name.toString() === req.user._id.toString()
        );
        //If user submmited review, update, otherwise create it.
        if (reviewIndex < 0) {
          product.reviews.push(review);
          product.numReviews = product.reviews.length;
        } else {
          product.reviews[reviewIndex] = review;
        }
        product.rating = (
          product.reviews.reduce((a, c) => c.rating + a, 0) /
          product.reviews.length
        ).toFixed(2);
        //       console.log("Review is " + JSON.stringify(product));
        /*
      product.save((err, prod) => {
        if (err) {
          res.status(400).json({
            message: err,
          });
        }
        if (prod) {
          return res.status(201).json({
            message: "Review saved sucessfully",
            product: prod,
          });
        }
      });*/
        let finalproduct = await Product.findByIdAndUpdate(
          productId,
          {
            reviews: product.reviews,
            numReviews: product.numReviews,
            rating: product.rating,
          },
          { new: true }
        );
        return res.status(200).json(finalproduct);
      } else {
        return res.status(400).json({ message: "Unable to find product" });
      }
    } else {
      return res.status(400).json({ error: "Product ID is required" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.addProductReview1 = async (req, res) => {
  try {
    //console.log("product ID is " + req.user._id);
    const productId = req.query.id;
    if (productId) {
      const product = await Product.findOne({ _id: productId });
      if (product) {
        /*   let today = new Date();
          var dd = String(today.getDate()).padStart(2, "0");
          var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
          var yyyy = today.getFullYear();
          today = mm + "/" + dd + "/" + yyyy; */

        /* const review = {
          name: req.user._id,
          rating: Number(req.body.rating),
          comment: req.body.comment,
          // review_date: today,
        };
*/
        const imageUpload = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
          const { path } = file;
          const newpath = await imageUpload(path);
          console.log(newpath);
          urls.push(newpath.url);
          //fs.unlinkSync(path);
        }
        //review.images = urls;

        let alreadyRated = product.reviews.find(
          (userId) => userId.name.toString() === req.user._id.toString()
        );
        if (alreadyRated) {
          const updateRating = await Product.updateOne(
            {
              reviews: { $elemMatch: alreadyRated },
            },
            {
              $set: {
                "reviews.$.rating": Number(req.body.rating),
                "reviews.$.comment": req.body.comment,
                "reviews.$.images": urls,
              },
            },
            {
              new: true,
            }
          );
        } else {
          const rateProduct = await Product.findByIdAndUpdate(
            productId,
            {
              $push: {
                reviews: {
                  rating: Number(req.body.rating),
                  comment: req.body.comment,
                  name: req.user._id,
                  images: urls,
                },
              },
            },
            {
              new: true,
            }
          );
        }

        const getallratings = await Product.findById(productId);

        let totalReviews = getallratings.reviews.length;
        let ratingsum = getallratings.reviews
          .map((item) => item.rating)
          .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalReviews);
        let finalproduct = await Product.findByIdAndUpdate(
          productId,
          {
            rating: actualRating,
            numReviews: totalReviews,
          },
          { new: true }
        );
        res.status(200).json(finalproduct);
        /*

        const reviewIndex = product.reviews.findIndex(
          (userId) => userId.name.toString() === req.user._id.toString()
        );
        //If user submmited review, update, otherwise create it.
        if (reviewIndex < 0) {
          product.reviews.push(review);
          product.numReviews = product.reviews.length;
        } else {
          product.reviews[reviewIndex] = review;
        }
        product.rating = (
          product.reviews.reduce((a, c) => c.rating + a, 0) /
          product.reviews.length
        ).toFixed(2);*/
        //       console.log("Review is " + JSON.stringify(product));
        /*  product.save((err, prod) => {
        if (err) {
          res.status(400).json({
            message: err,
          });
        }
        if (prod) {
          return res.status(201).json({
            message: "Review saved sucessfully",
            product: prod,
          });
        }
      });*/
      } else {
        return res.status(400).json({ message: "Unable to find product" });
      }
    } else {
      return res.status(400).json({ error: "Product ID is required" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getUserReviews = (req, res) => {
  Product.aggregate([
    //    { $match: { "reviews.name": "642effd2a1cfbda64464f726" } },
    {
      $project: {
        reviews: 1,
      },
    },
    { $unwind: "$reviews" },
    //   { $match: { "reviews.name": "642effd2a1cfbda64464f726" } },
  ])
    //.distinct("reviews")
    //.find().select("reviews")
    // .find({ name: "samosa" })
    .exec((error, data) => {
      if (error) return res.status(400).json({ error });
      if (data) {
        console.log("reviews" + data.length);
        if (req.query.all && req.query.all.toString() == "true") {
          return res.status(200).json({ size: data.length, reviews: data });
        }
        //if (!req.query.all && )
        else {
          const userReviews = data.filter(
            (userId) =>
              userId.reviews.name.toString() === req.user._id.toString()
          );
          return res
            .status(200)
            .json({ size: userReviews.length, reviews: userReviews });
        }
      } else {
        return res.status(400).json({ message: "No product reviews found" });
      }
    });
};

exports.getProductReviews = (req, res) => {
  const productId = req.query.id;
  const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      console.log("Reviews 1 are ******************" + JSON.stringify(product));

      if (error)
        return res.status(400).json({
          error,
        });
      if (product) {
        let myArray = product.reviews;
        let finalReviewList = myArray.slice(skip, limit + skip);
        console.log("Reviews are ******************" + JSON.stringify(myArray));
        //myArray.slice(skip, limit);
        //console.log(
        // "*********************Reviews are " + JSON.stringify(myArray)
        //);
        //product.reviews.slice(2, 3);
        return res
          .status(200)
          .json({ size: finalReviewList.length, reviews: finalReviewList });
      } else {
        return res.status(400).json({ message: "no reviews for the products" });
      }
    });
  }
};

exports.deleteProductReviews = (req, res) => {
  const productId = req.query.id;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (product) {
        product.reviews = [];
        product.save((err, prod) => {
          if (err) {
            res.status(400).json({
              message: err,
            });
          }
          if (prod) {
            return res.status(201).json({
              message: "Reviews deleted sucessfully",
              product: prod,
            });
          }
        });
      } else {
        return res.status(400).json({ message: "no reviews for the products" });
      }
    });
  }
};
