const Product = require("../models/product");
const slugify = require("slugify");
const shortid = require("shortid");
const { json } = require("express");

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

exports.addProduct = (req, res) => {
  const productObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
    price: req.body.price,
    quantity: req.body.quantity,
    description: req.body.description,
    category: req.body.category,
    createdBy: req.user._id,
    warrentyReturns: req.body.warrentyReturns,
  };
  /*
  if (req.files.length > 0) {
    productObj.productImages = req.files.map((file) => {
      return { img: file.filename };
    });
  }
  */
  console.log("**********Images are " + JSON.parse(req.body.productImages));
  if (req.body.productImages) {
    const productImages = JSON.parse(req.body.productImages);
    productObj.productImages = [];

    for (i in productImages) {
      productObj.productImages.push({ img: productImages[i] });
    }
  }

  if (req.body.inTheBox) {
    const boxItems = JSON.parse(req.body.inTheBox);
    //console.log("box Items are " + boxItems);
    productObj.inTheBox = [];

    for (i in boxItems) {
      productObj.inTheBox.push({ item: boxItems[i] });
    }
  }

  //Specifications
  /*productObj.specifications = {
    brand: req.body.brand,
    dimensions: req.body.dimensions,
    weight: req.body.weight,
    displayType: req.body.displayType,
    displaySize: req.body.displaySize,
    displayResolution: req.body.displayResolution,
    os: req.body.os,
    cpu: req.body.cpu,
    internalMemory: req.body.internalMemory,
    ram: req.body.ram,
    camera: req.body.camera,
    battery: req.body.battery,
    color: req.body.color,
  };*/

  //const specs = req.body.specifications;
  if (req.body.specs) {
    productObj.specifications = [];
    const specification = JSON.parse(req.body.specs);
    for (i in specification) {
      productObj.specifications.push({
        specType: specification[i][0],
        specValue: specification[i][1],
        specName: specification[i][2],
      });
    }
  }
  /*
  if (req.body.brand) {
    productObj.specifications.push({
      specValue: req.body.brand,
      specName: "Brand",
    });
  }
  if (req.body.dimensions) {
    productObj.specifications.push({
      specName: "Dimensions",
      specValue: req.body.dimensions,
    });
  }
  if (req.body.weight) {
    productObj.specifications.push({
      specName: "Weight",
      specValue: req.body.weight,
    });
  }
  if (req.body.displayType) {
    productObj.specifications.push({
      specName: "Display Type",
      specValue: req.body.displayType,
    });
  }
  if (req.body.displaySize) {
    productObj.specifications.push({
      specName: "Display Size",
      specValue: req.body.displaySize,
    });
  }
  if (req.body.displayResolution) {
    productObj.specifications.push({
      specName: "Display Resolution",
      specValue: req.body.displayResolution,
    });
  }
  if (req.body.os) {
    productObj.specifications.push({
      specName: "OS",
      specValue: "iOS",
    });
  }
  if (req.body.cpu) {
    productObj.specifications.push({
      specName: "CPU",
      specValue: req.body.cpu,
    });
  }
  if (req.body.internalMemory) {
    productObj.specifications.push({
      specName: "Internal Memory",
      specValue: req.body.internalMemory,
    });
  }
  if (req.body.ram) {
    productObj.specifications.push({
      specName: "RAM",
      specValue: req.body.ram,
    });
  }
  if (req.body.camera) {
    productObj.specifications.push({
      specName: "Camera",
      specValue: req.body.camera,
    });
  }
  if (req.body.battery) {
    productObj.specifications.push({
      specName: "Battery",
      specValue: req.body.battery,
    });
  }
  if (req.body.color) {
    productObj.specifications.push({
      specName: "Color",
      specValue: req.body.color,
    });
  }
*/
  //};

  const _prod = new Product(productObj);
  _prod.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) return res.status(201).json({ product });
  });

  //res.status(200).json({file: req.files, body: req.body});
};

exports.fetchProducts = (req, res) => {
  const category = req.query.category ? { category: req.query.category } : {};
  const subcategory = req.query.subcategory
    ? { "category.name": req.query.subcategory }
    : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: "i",
        },
      }
    : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };

  Product.find({ ...category })
    .find({ ...searchKeyword })
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

exports.getProducts = (req, res) => {
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
  }

  console.log(findArgs);
  Product.find(findArgs)
    .populate("category")
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
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

  console.log(findArgs);

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

  console.log(findArgs);

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
        console.log("Reviews are ******************" + JSON.stringify(myArray));
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
  console.log("product ID is " + productId);
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
        console.log("Today is " + today);
        const review = {
          name: req.body.name,
          rating: Number(req.body.rating),
          comment: req.body.comment,
          review_date: today,
        };
        console.log("Review is " + JSON.stringify(review));
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
