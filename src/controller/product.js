const Product = require("../models/product");
const Category = require("../models/category");
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

exports.addProduct = async (req, res) => {
  const productObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
    brand: req.body.brand,
    price: req.body.price,
    offer: req.body.offer,
    quantity: req.body.quantity,
    description: req.body.description,
    category: req.body.category,
    createdBy: req.user._id,
    seller: req.user._id,
    warrentyReturns: req.body.warrentyReturns,
    lengthInCM: req.body.lengthInCM,
    weightInCM: req.body.weightInCM,
    heightInCM: req.body.heightInCM,
    WeightInGrams: req.body.WeightInGrams,
  };

  if (req.files && req.files.length > 0) {
    productObj.productImages = [];
    for (i in req.files) {
      const prodFile = parser.format(
        path.extname(req.files[i].originalname).toString(),
        req.files[i].buffer
      );
      const uploadResult = await uploader.upload(prodFile.content);
      productObj.productImages.push({ img: uploadResult.secure_url });
    }
  }

  if (req.body.tags) {
    const _tags = JSON.parse(req.body.tags);
    productObj.tags = [];
    for (i in _tags) {
      productObj.tags.push(_tags[i].toLowerCase());
    }
  }

  if (req.body.avialableCities) {
    const avialableCities = JSON.parse(req.body.avialableCities);
    productObj.avialableCities = [];
    for (i in avialableCities) {
      productObj.avialableCities.push(avialableCities[i]);
    }
  }

  if (req.body.inTheBox) {
    const boxItems = JSON.parse(req.body.inTheBox);
    productObj.inTheBox = [];
    for (i in boxItems) {
      productObj.inTheBox.push({ item: boxItems[i] });
    }
  }

  if (req.body.specs) {
    productObj.specifications = [];
    const specification = JSON.parse(req.body.specs);
    for (i in specification) {
      productObj.specifications.push({
        specType: specification[i][0],
        specName: specification[i][1],
        specValue: specification[i][2],
      });
    }
  }

  const _prod = new Product(productObj);
  _prod.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) return res.status(201).json({ product });
  });

  //res.status(200).json({file: req.files, body: req.body});
};

exports.fetchProducts = (req, res) => {
  const category = req.query.searchKeyword
    ? { "category.name": req.query.searchKeyword }
    : {};
  const subcategory = req.query.searchKeyword
    ? { "category.name": req.query.searchKeyword }
    : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: "i",
        },
      }
    : {};
  const searchKeyword1 = req.query.searchKeyword
    ? { tags: req.query.searchKeyword }
    : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };

  // Product.find({ $or: [{ ...category }, { ...subcategory }] })
  //.find({ $or: [{ ...searchKeyword }, { ...searchKeyword1 }] })
  //.find({ ...searchKeyword })
  // Product.find({ ...category })
  Product.find({ $or: [{ ...searchKeyword }, { ...searchKeyword1 }] })
    //Product.find({ ...searchKeyword })
    .sort(sortOrder)
    .exec((error, products) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (products) {
        res.status(200).json({ products });
      }
    });
};
exports.fetchTags = (req, res) => {
  Product.distinct("tags").exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Tags are not found" + err,
      });
    }

    res.json({
      size: data.length,
      data,
    });
  });
};
exports.getProducts = (req, res) => {
  const category = req.body.category
    ? {
        // "category.slug": req.query
        //{
        // $regex: req.query.searchKeyword,
        // $options: "i",
        //},
        //   { $in: [req.query.searchKeyword] },
        category: { $in: req.body.category },
        // category: { name: req.query.searchKeyword },
      }
    : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: "i",
        },
      }
    : {};
  const searchKeyword1 = req.query.searchKeyword
    ? { tags: req.query.searchKeyword }
    : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowestprice"
      ? { price: 1 }
      : req.query.sortOrder === "highestprice"
      ? { price: -1 }
      : req.query.sortOrder === "nameascending"
      ? { slug: 1 }
      : { slug: -1 }
    : { _id: -1 };
  let limit = req.body.limit ? parseInt(req.body.limit) : 250;
  let skip = parseInt(req.body.skip);
  let findArgs = {};
  let select = req.body.select ? req.body.select : "";
  // let order = req.query.order ? slugify(req.query.order) : "slug";
  //let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  for (let key in req.body.filters) {
    if (key === "specifications") {
      let query1 = [];
      for (let x in req.body.filters[key]) {
        if (req.body.filters[key][x].length > 0) {
          query1.push({
            $and: [
              { "specifications.specName": x },
              { "specifications.specValue": { $in: req.body.filters[key][x] } },
            ],
          });
        }
      }
      findArgs["$and"] = query1;
    } else if (key === "price") {
      // gte -  greater than price [0-10]
      // lte - less than
      if (req.body.filters[key].length > 0) {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.aggregate([
    {
      $facet: {
        categorizedByCategories: [
          {
            $match: {
              $or: [{ ...searchKeyword }, { ...searchKeyword1 }, findArgs],
            },
          },
          {
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $group: {
              _id: "$cat.name",
              count: { $sum: 1 },
            },
          },

          // Sort by year descending
          { $sort: { count: -1, _id: -1 } },
        ],
        /*  categorizedByTags: [
          {
            $match: {
              $or: [{ ...searchKeyword }, { ...searchKeyword1 }, findArgs],
            },
          },
          { $unwind: "$category" },
          {
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          //  { $sortByCount: "$cat.name" },
        ],*/
        categorizedByBrand: [
          {
            $match: {
              $or: [{ ...searchKeyword }, { ...searchKeyword1 }, findArgs],
            },
          },
          //   { $unwind: "$brand" },
          // { $sortByCount: "$brand" },
          {
            $group: {
              _id: "$brand",
              count: { $sum: 1 },
            },
          },

          // Sort by year descending
          { $sort: { count: -1, _id: -1 } },
        ],
        /*   categorizedByPrice: [
          // Filter out documents without a price e.g., _id: 7
          { $match: { price: { $exists: 1 } } },
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [0, 50000, 70000, 90000, 100000],
              default: "Other",
              output: {
                count: { $sum: 1 },
                name: { $push: "$name" },
                price: { $push: "$price" },
              },
            },
          },
        ],*/
        categorizedByPriceAuto: [
          {
            $match: {
              $or: [{ ...searchKeyword }, { ...searchKeyword1 }, findArgs],
            },
          },
          {
            $bucketAuto: {
              groupBy: "$price",
              buckets: 1,
            },
          },
        ],
        filteredProducts: [
          {
            $match: {
              $or: [{ ...searchKeyword }, { ...searchKeyword1 }, findArgs],
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
              price: 1,
              rating: 1,
              productImages: 1,
              seller: 1,
            },
          },
          {
            $limit: limit,
          },
          { $skip: skip },
          { $sort: sortOrder },
        ],
      },
    },
  ])
    /* Product.find(findArgs)
    .find({ $or: [{ ...searchKeyword }, { ...searchKeyword1 }] })
    //  .find({
    //  $or: [{ ...category }, { ...searchKeyword }, { ...searchKeyword1 }],
    //})
    .find({ ...category })
    //  .populate("category")
    // .populate("seller")
    .populate({ path: "category", select: ["name"] })
    .populate({
      path: "seller",
      select: ["username"],
      populate: { path: "user", select: ["_id"] },
    })
    .select(select)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)*/
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found" + err,
        });
      }

      res.json({
        size: data.length,
        data,
      });
    });

  //console.log(findArgs);
};

exports.getProductFilters = (req, res) => {
  let findArgs = {};

  for (let key in req.body.filters) {
    if (key === "specifications") {
      let query1 = [];
      for (let x in req.body.filters[key]) {
        if (req.body.filters[key][x].length > 0) {
          query1.push({
            $and: [
              { "specifications.specName": x },
              { "specifications.specValue": { $in: req.body.filters[key][x] } },
            ],
          });
        }
      }
      findArgs["$and"] = query1;
    } else if (key === "price") {
      // gte -  greater than price [0-10]
      // lte - less than
      if (req.body.filters[key].length > 0) {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = req.body.filters[key];
      }
    }
    //}
  }

  //console.log(findArgs);

  Product.aggregate([
    { $match: findArgs },
    { $unwind: "$specifications" },
    {
      $project: {
        name: "$specifications.specName",
        value: { name: "$specifications.specValue" },
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$name",
        values: { $addToSet: "$value" },
      },
    },
  ]).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      data,
    });
  });
};

exports.getProductFilters1 = (req, res) => {
  let findArgs = {};

  for (let key in req.body.filters) {
    if (key === "specifications") {
      let query1 = [];
      for (let x in req.body.filters[key]) {
        if (req.body.filters[key][x].length > 0) {
          query1.push({
            $and: [
              { "specifications.specName": x },
              { "specifications.specValue": { $in: req.body.filters[key][x] } },
            ],
          });
        }
      }
      findArgs["$and"] = query1;
    } else if (key === "price") {
      // gte -  greater than price [0-10]
      // lte - less than
      if (req.body.filters[key].length > 0) {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = req.body.filters[key];
      }
    }
    //}
  }

  //console.log(findArgs);

  Product.aggregate([
    { $match: findArgs },
    { $unwind: "$specifications" },
    {
      $project: {
        name: "$specifications.specName",
        value: { name: "$specifications.specValue" },
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$name",
        values: { $addToSet: "$value" },
      },
    },
  ]).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      data,
    });
  });
};
exports.addImagesToProduct = async (req, res) => {
  const productId = req.query.id;
  const productObj = {};

  if (req.files && req.files.length > 0) {
    productObj.productImages = [];
    for (i in req.files) {
      const prodFile = parser.format(
        path.extname(req.files[i].originalname).toString(),
        req.files[i].buffer
      );
      const uploadResult = await uploader.upload(prodFile.content);
      productObj.productImages.push({ img: uploadResult.secure_url });
    }
  }

  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        Product.findOneAndUpdate(
          { _id: productId },
          { productImages: productObj.productImages },
          { new: true }
        ).exec((error, updatedProduct) => {
          if (error) return res.status(400).json({ error });
          if (updatedProduct) {
            return res.status(201).json({ product: updatedProduct });
          }
        });
      } else {
        return res.status(400).json({ error: "Invalid product ID" });
      }
    });
  } else {
    if (error) return res.status(400).json({ error: "Provide product ID" });
  }
};

exports.addSpecificationsToProduct = (req, res) => {
  const productId = req.query.id;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        //console.log("Specs are " + JSON.stringify(req.body.specs));
        const specification = JSON.parse(req.body.specs);
        if (specification) {
          product.specifications = [];
          // const specification = JSON.parse(req.body.specs);
          // console.log("Specifications are " + JSON.stringify(specification));
          for (i in specification) {
            product.specifications.push({
              specType: specification[i][0],
              specName: specification[i][1],
              specValue: specification[i][2],
              // filterable: specification[i][3],
            });
          }
          //product.specifications.push(_specifications);
          product.save((err, prod) => {
            if (err) {
              res.status(400).json({
                message: err,
              });
            }
            if (prod) {
              return res.status(201).json({
                product: prod,
                message: "Specs saved sucessfully",
              });
            }
          });
        } else {
          return res.status(400).json({ error: "Specs missing" });
        }
        /*Product.findOneAndUpdate(
          { _id: productId },
          { specifications: productObj.specifications },
          { new: true }
        ).exec((error, updatedProduct) => {
          if (error) return res.status(400).json({ error });
          if (updatedProduct) {
            return res.status(201).json({ product: updatedProduct });
          }
        });*/
      } else {
        return res.status(400).json({ error: "Invalid product ID" });
      }
    });
  } else {
    if (error) return res.status(400).json({ error: "Provide product ID" });
  }
};

exports.getProducts1 = (req, res) => {
  let order = req.query.order ? slugify(req.query.order) : "slug";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let skip = parseInt(req.query.skip);
  let searchQuery = req.query.searchQuery;
  let findArgs = {};

  for (let key in req.query.filters) {
    if (req.query.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.query.filters[key][0],
          $lte: req.query.filters[key][1],
        };
      } else {
        findArgs[key] = req.query.filters[key];
      }
    }
  }

  //console.log(findArgs);

  if (searchQuery) {
    Product.find(findArgs)
      .find({ $text: { $search: searchQuery } })
      .populate("name")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .exec((error, products) => {
        if (error) return res.status(400).json({ success: false, error });
        res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  } else {
    Product.find(findArgs)
      .populate("name")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .exec((error, products) => {
        if (error) return res.status(400).json({ success: false, error });
        res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  }
};

exports.fetchProductDetails = (req, res) => {
  const id = req.query.id ? { _id: req.query.id } : {};

  Product.findOne({ ...id }).exec((error, product) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (product) {
      res.status(200).json({ product });
    }
  });
};

createProducts = (Products, parentId = null) => {
  const productList = [];
  let product;
  if (parentId == null) {
    product = Products.filter((prod) => prod.parentId == undefined);
  } else {
    product = Products.filter((prod) => prod.parentId == parentId);
  }
  for (let prod of product) {
    productList.push({
      _id: prod._id,
      name: prod._name,
      slug: prod.slug,
      children: createProducts(products, prod._id),
    });
  }
  return productList;
};

createCategories = (category, parentId = null) => {
  const categoryList = [];
  let category1;
  if (parentId == null) {
    category1 = category.filter((cat) => cat.parentId == undefined);
  } else {
    category1 = category.filter((cat) => cat.parentId == parentId);
  }
  for (let cat of category1) {
    categoryList.push(createCategories(category, cat._id));
  }
  return categoryList;
};

/*
exports.getProductFilters = (req, res) => {
  let order = req.query.order ? slugify(req.query.order) : "slug";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowestprice"
      ? { price: 1 }
      : req.query.sortOrder === "highestprice"
      ? { price: -1 }
      : req.query.sortOrder === "nameascending"
      ? { slug: 1 }
      : { slug: -1 }
    : { _id: -1 };
  let limit = req.body.limit ? parseInt(req.body.limit) : 5;
  let skip = parseInt(req.body.skip);

  let findArgs1 = {};
  let findArgs2 = {};

  for (let key in req.body.filters) {
    if (key === "specifications") {
      let query1 = [];
      for (let x in req.body.filters[key]) {
        console.log("Filters are " + JSON.stringify(req.body.filters));
        if (req.body.filters[key][x].length > 0) {
          query1.push({
            $and: [
              { "specifications.specName": x },
              { "specifications.specValue": { $in: req.body.filters[key][x] } },
            ],
          });
        }
      }
      findArgs1["$and"] = query1;
      findArgs2["$and"] = query1;
      console.log("x1 is " + JSON.stringify(findArgs1));
    } else if (key === "price") {
      // gte -  greater than price [0-10]
      // lte - less than
      if (req.body.filters[key].length > 0) {
        findArgs1[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
        findArgs2[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else if (key === "category") {
      // gte -  greater than price [0-10]
      // lte - less than
      if (req.body.filters[key]) {
        findArgs1[key] = {
          $in: req.body.filters[key],
        };
      }
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs1[key] = req.body.filters[key];
        findArgs2[key] = req.body.filters[key];
      }
    }
  }

  console.log("Find Args " + JSON.stringify(findArgs1));
  Product.find(findArgs1)
    .populate("category")
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      if (products) {
        Product.aggregate([
          { $match: findArgs2 },
          // { $match: findArgs3 },
          { $unwind: "$specifications" },
          {
            $project: {
              name: "$specifications.specName",
              value: { name: "$specifications.specValue" },
              type: "$specifications.specType",
              _id: 0,
            },
          },
          {
            $group: {
              _id: "$name",
              values: { $addToSet: "$value" },
            },
          },
        ]).exec((err, filters) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }
          if (filters) {
            res.json({
              size: products.length,
              products,
              filters,
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Products not found",
        });
      }
    });
};
*/

/*const productId = req.body.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        const review = {
          name: req.user.firstName,
          rating: Number(req.body.rating),
          comment: req.body.comment,
        };
        console.log("Review is " + review);
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce((a, c) => c.rating + a, 0) /
          product.reviews.length;
        product.save((err, prod) => {
          if (err) {
            res.status(400).json({
              message: "Something went wrong",
            });
          }
          if (prod) {
            return res.status(201).json({ product: prod });
          }
        });
      }
    });
  } else {
    return res.status(400).json({ error: "Product ID is required" });
  }*/

exports.fetchCartProductDetails = (req, res) => {
  //let type = req.query.type;
  let productIds = req.query.id;
  let ids = req.query.id.split(",");
  productIds = [];
  productIds = ids.map((item) => {
    return item;
  });
  Product.find({ _id: { $in: productIds } }).exec((err, product) => {
    if (err) return res.status(400).send(err);
    return res.status(200).send(product);
  });
};

exports.fetchProductsBySlug = (req, res) => {
  const { slug } = req.params;
  Category.findOne({ slug: slug })
    .select("_id")
    .exec((error, category) => {
      if (error) {
        return res.status(400).json({ error });
      }

      if (category) {
        Product.find({ category: category._id }).exec((error, products) => {
          if (error) {
            return res.status(400).json({ error });
          }

          if (products.length > 0) {
            res.status(200).json({
              products,
              productsByPrice: {
                under5k: products.filter((product) => product.price <= 5000),
                under10k: products.filter(
                  (product) => product.price > 5000 && product.price <= 10000
                ),
                under15k: products.filter(
                  (product) => product.price > 10000 && product.price <= 15000
                ),
                under20k: products.filter(
                  (product) => product.price > 15000 && product.price <= 20000
                ),
                under30k: products.filter(
                  (product) => product.price > 20000 && product.price <= 30000
                ),
              },
            });
          }
        });
      }
    });
};

exports.fetchProductDetailsById = (req, res) => {
  const { productId } = req.params;
  //console.log("product ID is " + productId);
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(200).json({ product });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.deleteProductById = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Product.deleteOne({ _id: productId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.addProductReview = (req, res) => {
  //console.log("product ID is " + req.user._id);
  const productId = req.query.id;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        let today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + "/" + dd + "/" + yyyy;
        //console.log("Today is " + today);
        const review = {
          name: req.body.name,
          rating: Number(req.body.rating),
          comment: req.body.comment,
          review_date: today,
        };
        //console.log("Review is " + JSON.stringify(review));
        product.reviews.push(review);
        product.numReviews = product.reviews.length;

        product.rating =
          product.reviews.reduce((a, c) => c.rating + a, 0) /
          product.reviews.length;
        product.save((err, prod) => {
          if (err) {
            res.status(400).json({
              message: err,
            });
          }
          if (prod) {
            return res.status(201).json({
              product: prod.reviews[prod.reviews.length - 1],
              message: "Review saved sucessfully",
            });
          }
        });
      }
    });
  } else {
    return res.status(400).json({ error: "Product ID is required" });
  }
};

exports.updateProductReviews = (req, res) => {
  const productId = req.query.id;
  const skip = req.query.page ? (req.query.page - 1) * 5 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (product) {
        let myArray = product.reviews;
        //console.log("Reviews are ******************" + JSON.stringify(myArray));
        //myArray.slice(skip, limit);
        //console.log(
        // "*********************Reviews are " + JSON.stringify(myArray)
        //);
        //product.reviews.slice(2, 3);
        res.status(200).json({ reviews: myArray.slice(skip, limit + skip) });
      }
    });
  }
};

exports.addProductVariant = (req, res) => {
  //console.log("product ID is " + req.user._id);
  const productId = req.query.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        //console.log("I am adding prod variant" + JSON.parse(req.body));
        if (req.body.variants) {
          let _variant = [];
          // const variantBody = JSON.parse(req.body.variants);
          const variantBody = req.body.variants;
          for (i in variantBody) {
            _variant.push({
              varationName: variantBody[i][0],
              varationValue: variantBody[i][1],
            });
          }
          const variant = {
            variations: _variant,
            varaiantPrice: req.body.varaiantPrice,
            quantity: req.body.quantity,
          };
          product.variants.push(variant);
          product.save((err, prod) => {
            if (err) {
              res.status(400).json({
                message: err,
              });
            }
            if (prod) {
              return res.status(201).json({
                product: prod,
                message: "Variants saved sucessfully",
              });
            }
          });
        } else {
          return res.status(400).json({ error: "Varaiants are required" });
        }
      }
    });
  } else {
    return res.status(400).json({ error: "Product ID is required" });
  }
};

exports.addProductTags = (req, res) => {
  const productId = req.query.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        if (req.body.tags) {
          const _tags = JSON.parse(req.body.tags);
          product.tags = [];
          for (i in _tags) {
            product.tags.push(_tags[i].toLowerCase());
          }
          product.save((err, prod) => {
            if (err) {
              res.status(400).json({
                message: err,
              });
            }
            if (prod) {
              return res.status(201).json({
                product: prod,
                message: "tags saved sucessfully",
              });
            }
          });
        } else {
          return res.status(400).json({ error: "Tags are required" });
        }
      }
    });
  } else {
    return res.status(400).json({ error: "Product ID is required" });
  }
};
