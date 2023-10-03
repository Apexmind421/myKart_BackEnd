const Product = require("../models/product");
const Order = require("../models/order");
const Category = require("../models/category");
const Teams = require("../models/teams");
const ProductViewHistory = require("../models/productViews");
const Attribute = require("../models/attribute");
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

/***************************************
 * 
 * 
 * 
  Product Add methods - Start here
 * 
 * 
 * 
***************************************/
exports.addProduct = async (req, res) => {
  try {
    const productObj = {
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      teamPrice: req.body.teamPrice,
      actualPrice: req.body.actualPrice,
      offer: req.body.offer,
      quantity: req.body.quantity,
      description: req.body.description,
      category: req.body.category,
      seller: req.user._id, //TO DO
      warrentyReturns: req.body.warrentyReturns,
      lengthInCM: req.body.lengthInCM,
      widthInCM: req.body.widthInCM,
      heightInCM: req.body.heightInCM,
      WeightInGrams: req.body.WeightInGrams,
      flashSale: req.body.flashSale,
      slug: slugify(req.body.name),
      createdBy: req.user._id,
      discountType: req.body.discountType,
      needToBuy: req.body.needToBuy,
      needToView: req.body.needToView,
      needToRegister: req.body.needToRegister,
      tax: req.body.tax,
      onSale: req.body.onSale,
      discount: req.body.discount,
      shippingCost: req.body.shippingCost,
    };

    if (req.files && req.files.length > 0) {
      console.log("I am here 00007");
      productObj.productImages = [];
      for (i in req.files) {
        const prodFile = parser.format(
          path.extname(req.files[i].originalname).toString(),
          req.files[i].buffer
        );

        const uploadResult = await uploader.upload(prodFile.content);
        if (i == 0) {
          productObj.thumbnailImage = uploadResult.secure_url;
        } else productObj.productImages.push({ img: uploadResult.secure_url });
      }
    }

    if (req.body.tags) {
      const _tags = JSON.parse(req.body.tags);
      productObj.tags = [];
      for (i in _tags) {
        productObj.tags.push(_tags[i].toLowerCase());
      }
    }

    if (req.body.inTheBox) {
      const boxItems = JSON.parse(req.body.inTheBox);
      productObj.inTheBox = [];
      for (i in boxItems) {
        productObj.inTheBox.push(boxItems[i]);
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

    if (req.body.attributes) {
      productObj.attributes = [];
      const attribute = JSON.parse(req.body.attributes);
      for (i in attribute) {
        productObj.attributes.push(attribute[i]);
      }
    }
    /*
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
  if (req.body.avialableCities) {
    const avialableCities = JSON.parse(req.body.avialableCities);
    productObj.avialableCities = [];
    for (i in avialableCities) {
      productObj.avialableCities.push(avialableCities[i]);
    }
  }
  if (req.body.productVariants) {
    product.variants = [];
    const productVariants = JSON.parse(req.body.productVariants);
    for (i in productVariants) {
      let _variant = [];
      const variantBody = productVariants[i];
      for (i in variantBody) {
        _variant.push(variantBody[i]);
      }
      const variant = {
        variations: _variant,
        varaiantPrice: req.body.varaiantPrice,
        quantity: req.body.quantity,
        sku: Math.random().toString(36).substring(2, 11),
      };
      product.variants.push(variant);
    }
  }
  */

    console.log("addProduct 001 " + JSON.stringify(productObj));
    const _prod = new Product(productObj);
    _prod.save((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        if (req.body.productVariants) {
          const variantObjArray = [];
          const productVariants = req.body.productVariants;
          for (j in productVariants) {
            let _variant = [];
            const variantBody = productVariants[j].variants;
            for (i in variantBody) {
              _variant.push(variantBody[i]);
            }
            const variantObj = {
              variations: _variant,
              price: productVariants[j].price,
              teamPrice: productVariants[j].teamPrice,
              actualPrice: productVariants[j].actualPrice,
              quantity: productVariants[j].quantity,
              discount: productVariants[j].discount
                ? productVariants[j].discount
                : "",
              shippingCost: productVariants[j].shippingCost
                ? productVariants[j].shippingCost
                : "",
              lengthInCM: productVariants[j].lengthInCM
                ? productVariants[j].lengthInCM
                : "",
              widthInCM: productVariants[j].widthInCM
                ? productVariants[j].widthInCM
                : "",
              heightInCM: productVariants[j].heightInCM
                ? productVariants[j].heightInCM
                : "",
              WeightInGrams: productVariants[j].WeightInGrams
                ? productVariants[j].WeightInGrams
                : "",
              product: product._id,
              sku: Math.random().toString(36).substring(2, 11),
            };
            variantObjArray.push(variantObj);
          }
          ProductVariant.insertMany(variantObjArray).then(
            (err, _prodVariant) => {
              if (err) {
                res.status(400).json({
                  message: err,
                });
              }
              if (_prodVariant) {
                return res.status(201).json({
                  product: product,
                  productVariants: _prodVariant,
                  message: "Product created sucessfully",
                });
              }
            }
          );
        } else {
          return res.status(201).json({
            product: product,
            message: "Product created sucessfully",
          });
        }
      } else
        return res.status(400).json({ message: "Could not create product" });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  //res.status(200).json({file: req.files, body: req.body});
};
exports.addProductTags = (req, res) => {
  const productId = req.query.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        if (req.body.tags && req.body.tags.length > 0) {
          const _tags = req.body.tags;
          //product.tags = [];
          for (i in _tags) {
            const tagIndex = product.tags.findIndex((x) => x == _tags[i]);
            if (tagIndex < 0) product.tags.push(_tags[i]);
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
exports.addProductAttributes = (req, res) => {
  const productId = req.query.id;
  console.log("Prod ID is ", productId);
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        const attributes =
          //JSON.parse(
          req.body.attributes;
        //);
        if (attributes) {
          /*  product.attributes = [];
          for (i in attributes) {
            product.attributes.push(attributes[i]);
          }*/
          if (product.attributes) {
            ProductVariant.deleteMany({
              product: productId,
            }).exec((error, result) => {
              if (error)
                console.log("Error occured in deleting productVariants");
              if (result) {
                console.log("Successfully deleted productVariants");
              }
            });
          }
          product.attributes = attributes;
          console.log("Specs are " + JSON.stringify(product.attributes));
          product.save((err, prod) => {
            if (err) {
              res.status(400).json({
                message: err,
              });
            }
            if (prod) {
              /*const deleteVariants = ProductVariant.deleteMany({
                product: productId,
              });*/

              return res.status(201).json({
                product: prod,
                message: "Attributes saved sucessfully",
              });
            }
          });
        } else {
          return res.status(400).json({ error: "Attributes missing" });
        }
      } else {
        return res.status(400).json({ error: "Invalid product ID" });
      }
    });
  } else {
    if (error) return res.status(400).json({ error: "Provide product ID" });
  }
};
/***************************************
 * 
 * 
 * 
  Product Update method - Start here
 * 
 * 
 * 
***************************************/
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    //  console.log("xxx 1 " + JSON.stringify(req.body));
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const productObj = req.body;
    /* if (req.files && req.files.length > 0) {
      productObj.productImages = [];
      for (i in req.files) {
        const prodFile = parser.format(
          path.extname(req.files[i].originalname).toString(),
          req.files[i].buffer
        );
        const uploadResult = await uploader.upload(prodFile.content);
        productObj.productImages.push({ img: uploadResult.secure_url });
      }
    }*/
    console.log("xxx 2 " + JSON.stringify(productObj));
    const _updateProduct = await Product.findByIdAndUpdate(id, productObj, {
      new: true,
    });
    res.status(200).json(_updateProduct);
  } catch (error) {
    //throw new Error(error);
    return res.status(400).json({ message: error.message });
  }
};

/***************************************
 * 
 * 
 * 
  Product Variant methods - Start here
 * 
 * 
 * 
***************************************/
//Check if product ID is present
//Then check if there is a varaint with the same varaintoptions,
//Update it if there is
//Other wise add it.
exports.addProductVariant = (req, res) => {
  //console.log("product ID is " + req.user._id);
  const productId = req.query.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        //console.log("I am adding prod variant" + JSON.parse(req.body));
        if (req.body.productVariants) {
          const variantObjArray = [];
          const productVariants = req.body.productVariants;
          for (j in productVariants) {
            if (productVariants[j].quantity > product.quanity) {
              return res.status(400).json({
                message: "Product variant quanity exceeded product quanity",
              });
            }
            let _variant = [];
            const variantBody = productVariants[j].variants;
            for (i in variantBody) {
              _variant.push(variantBody[i]);
            }
            const variantObj = {
              variations: _variant,
              price: productVariants[j].price
                ? productVariants[j].price
                : product.price,
              actualPrice: productVariants[j].actualPrice
                ? productVariants[j].actualPrice
                : product.actualPrice,
              teamPrice: productVariants[j].teamPrice
                ? productVariants[j].teamPrice
                : product.teamPrice,
              quantity: productVariants[j].quantity,
              discount: productVariants[j].discount
                ? productVariants[j].discount
                : product.discount,
              shippingCost: productVariants[j].shippingCost
                ? productVariants[j].shippingCost
                : product.shippingCost,
              lengthInCM: productVariants[j].lengthInCM
                ? productVariants[j].lengthInCM
                : product.lengthInCM,
              widthInCM: productVariants[j].widthInCM
                ? productVariants[j].widthInCM
                : product.widthInCM,
              heightInCM: productVariants[j].heightInCM
                ? productVariants[j].heightInCM
                : product.heightInCM,
              WeightInGrams: productVariants[j].WeightInGrams
                ? productVariants[j].WeightInGrams
                : product.WeightInGrams,
              product: product._id,
              sku: Math.random().toString(36).substring(2, 11),
            };
            variantObjArray.push(variantObj);
          }
          try {
            ProductVariant.insertMany(variantObjArray)
              //  .populate("variations")
              .then((_prodVariant) => {
                /*   if (err) {
                return res.status(400).json({ err });
              } */
                if (_prodVariant) {
                  return res.status(201).json({
                    product: product,
                    productVariants: _prodVariant,
                    message: "Variants saved sucessfully",
                  });
                }
              });
          } catch (error) {
            return res.status(500).json({ message: error.message });
          }
        } else {
          return res.status(400).json({ message: "Varaiants are required" });
        }
      }
    });
  } else {
    return res.status(400).json({ message: "Product ID is required" });
  }
};
//Update the productVariant using the varaint ID
exports.updateProductVariant = async (req, res) => {
  //Check if product and productVaraint are been provided
  //If provided, check if they exist
  //If they exist, update the productVaraint
  try {
    const { productId, varaintId } = req.query;
    if (productId && varaintId) {
      const productExist = await Product.findOne({ _id: productId });
      const varaintExist = await ProductVariant.findOne({ _id: varaintId });
      if (productExist && varaintExist) {
        let updateVariantObj = req.body;
        const updateVariantStatus = await ProductVariant.findByIdAndUpdate(
          varaintId,
          updateVariantObj,
          { new: true, upsert: true }
        );
        res.json(updateVariantStatus);
      } else {
        return res.status(400).json({ error: "Invalid Inputs" });
      }
    } else {
      return res.status(400).json({ error: "Missing inputs" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
//Search the productVariant using the varaint ID
exports.fetchProductVariants = async (req, res) => {
  const findArgs = req.query.id ? { product: req.query.id } : {};
  ProductVariant.find(findArgs, {
    product: 0,
    __v: 0,
    createdAt: 0,
    updatedAt: 0,
  })
    .populate({ path: "variations", select: ["name", "value"] })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Variants are not found" + err,
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};
//Delete the productVaraint using the varinat ID
exports.deleteProductVariant = (req, res) => {
  const variantId = req.query.id;
  if (variantId) {
    ProductVariant.deleteOne({ _id: variantId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
exports.addProductVariant1 = (req, res) => {
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
          console.log(
            "I am adding prod variant" + JSON.stringify(req.body.variants)
          );
          const variantBody = req.body.variants;
          for (i in variantBody) {
            _variant.push(variantBody[i]);
          }

          const variant = {
            variations: _variant,
            varaiantPrice: req.body.varaiantPrice,
            quantity: req.body.quantity,
            sku: Math.random().toString(36).substring(2, 11),
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
exports.addProductVariant2 = (req, res) => {
  //console.log("product ID is " + req.user._id);
  const productId = req.query.productId;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        //console.log("I am adding prod variant" + JSON.parse(req.body));
        if (req.body.productVariants) {
          // product.variants=[];
          const productVariants = req.body.productVariants;
          for (j in productVariants) {
            let _variant = [];
            const variantBody = productVariants[j].variants;
            for (i in variantBody) {
              _variant.push(variantBody[i]);
            }
            console.log(
              "I am adding prod variant" + JSON.stringify(product.variants)
            );
            const variant = {
              variations: _variant,
              variantPrice: productVariants[j].variantPrice,
              quantity: productVariants[j].quantity,
              sku: Math.random().toString(36).substring(2, 11),
            };
            console.log("I am adding prod variant1" + JSON.stringify(variant));
            product.variants.push(variant);
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

/***************************************
 * 
 * 
 * 
  Attribute methods - Start here
 * 
 * 
 * 
***************************************/
exports.addAttributes = (req, res) => {
  if (req.body.attributes) {
    Attribute.findOne(req.body.attributes).exec(
      (error, productVariantOption) => {
        if (error)
          return res.status(400).json({
            message: "Product Attribute is not registered",
          });
        if (productVariantOption) {
          return res.status(401).json({
            message: "Product Attribute is already registered",
          });
        } else {
          const _option = new Attribute(req.body.attributes);
          _option.save((err, data) => {
            console.log("Data is " + JSON.stringify(data));
            if (err) {
              console.log("Error is " + JSON.stringify(err));
              return res.status(400).json({
                message: "Something went wrong",
                err,
              });
            }
            if (data) {
              return res
                .status(201)
                .json({ data, message: "Attribute created successfully" });
            }
          });
        }
      }
    );
  }
};
exports.fetchAttributes = (req, res) => {
  Attribute.find()
    //.distinct("tags")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Attributes are not found" + err,
        });
      }

      res.json({
        size: data.length,
        data,
      });
    });
};
exports.fetchProductVariantOptions = (req, res) => {
  Attribute.find().exec((error, productVariantOption) => {
    if (error) return res.status(400).json({ error });
    if (productVariantOption) {
      res.status(200).json({ message: "ok", data: productVariantOption });
    }
  });
};
exports.deleteAttributes = (req, res) => {
  const optionId = req.query.id;
  if (optionId) {
    Attribute.deleteOne({ _id: optionId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

/***************************************
 * 
 * 
 * 
  Product Details methods - Start here
 * 
 * 
 * 
***************************************/
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
exports.fetchProductDetails1 = async (req, res) => {
  const id = req.query.id ? { _id: req.query.id } : {};
  try {
    const product = await Product.findOne(
      { ...id },
      {
        flashSale: 0,
        onSale: 0,
        updatedAt: 0,
        createdAt: 0,
        __v: 0,
        createdBy: 0,
      }
    )
      // .populate("options")
      // .populate("variants.variations")
      // .populate("seller")
      //.populate({ path: "variants", select: ["name"] })
      .populate({ path: "category", select: ["name"] });
    /*  .populate({
      path: "seller",
      select: ["username"],
      populate: { path: "user", select: ["_id"] },
    }) */

    if (product) {
      //Limit the product views to show.
      let limmitedReviews = product.reviews.reverse().slice(0, 5);
      product.reviews = limmitedReviews;
      //product Questions
      const questions = await Questions.find({ product: product._id });

      return res.status(200).json({ product: product, questions: questions });
    } else {
      return res.status(400).json({ message: "not able to find the product" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
/*
 * Fetch Product Details:
 * Check if referenceID is present
 * If referenceID is present, verify if reference is teambuy,
 * If teamBuy, verify if the type is View, Buy, Slash
 * If Type is View,
 *    *
 * If Type is Buy,
 * If Type is Slash
 */
exports.fetchProductDetails = async (req, res) => {
  try {
    //Set Variables
    const id = req.query.id ? { _id: req.query.id } : {};
    const referenceID = req.query.referenceID
      ? req.query.referenceID
      : undefined;
    let teamBuy = false;
    let args = {};
    let teamExpired = false;
    let teamType;
    let closeGroup = false;
    const orderStatus = {
      type: "confirmed",
    };
    let isTeamValid;
    const fieldsToExclude = {
      updatedAt: 0,
      createdAt: 0,
      __v: 0,
      createdBy: 0,
    };

    //Validate if team reference ID is valid
    if (referenceID) {
      isTeamValid = await Teams.findById(referenceID).select(
        "totalRequired currentRequired status owner members createdAt type"
      );
      //If Team found with the reference id, validate whether team expired or user is already a member of the team.
      if (isTeamValid && isTeamValid.status == "Open") {
        teamType = isTeamValid.type;

        //Check if the team member is already exist, and team is not yet completed
        const alreadyMember = isTeamValid.members.findIndex(
          (x) => x == req.user._id
        );
        if (alreadyMember < 0 && isTeamValid.currentRequired > 0) {
          teamBuy = true;
          //In case of only team Type is view or slash, update the team member
          if (teamType == "View" || teamType == "Slash") {
            args = {
              $push: {
                members: req.user._id,
              },
            };
          }
        }

        //Check if the team expired, ie. if created date is older than 24 hrs.
        if (
          teamBuy == true &&
          isTeamValid.createdAt < Date.now() - 24 * 60 * 60 * 1000
        ) {
          args = { status: "Cancelled" };
          teamExpired = true;
        }

        //Check if the user is the last member in the group, close the team.
        if (
          teamExpired == false &&
          teamBuy == true &&
          isTeamValid.currentRequired < 2 &&
          (teamType == "View" || teamType == "Slash")
        ) {
          args = { ...args, status: "Closed" };
          closeGroup = true;
        }
      }
    }
    //Fetch Product Variant details
    if (id) {
      Product.findOne({ ...id }, fieldsToExclude)
        .populate({ path: "category", select: ["name"] })
        .populate({ path: "attributes", select: ["name", "value"] })
        .exec((error, product) => {
          if (error)
            return res.status(400).json({
              error,
            });
          if (product) {
            //Limit the product reviews to show to 5.
            //TO DO: Think of a better way.
            let limitedReviews = product.reviews.reverse().slice(0, 5);
            product.reviews = limitedReviews;

            // Create history record for product view
            const productViews = ProductViewHistory.create({
              product: product._id,
              viewed_by: req.user._id,
              category: product.category,
              view_date: new Date(),
            });

            //Update the product by incrementing views by 1.
            Product.findOneAndUpdate(
              { _id: product._id },
              { $inc: { views: 1 } },
              { new: true }
            ).exec();

            //Update team record in case reference ID and team buy are there.
            //Update when team type is view or slash, with args
            //If type is others, update only when team is expired.
            //TO DO: Check if team is expired or closed.
            //TO DO: If team buy is View or slash,
            //           if the currentRequired reaches zero, update relavent orders to confirmed

            if (
              teamBuy == true &&
              teamExpired == false &&
              (teamType == "View" || teamType == "Slash")
            ) {
              Teams.findByIdAndUpdate(
                referenceID,
                { ...args, $inc: { currentRequired: -1 } },
                { new: true }
              ).exec();
              //Query orders table where items team is matched with referenceID
              if (closeGroup) {
                Order.findOneAndUpdate(
                  { team: referenceID },
                  { $push: { orderStatus: orderStatus } }
                ).exec();
              }
            }
            if (teamBuy == true && teamExpired == true) {
              Teams.findByIdAndUpdate(
                referenceID,
                { ...args },
                { new: true }
              ).exec();
            }
            return res.status(200).json(product);
          } else {
            return res
              .status(400)
              .json({ message: "not able to find the product" });
          }
        });
    } else {
      return res.status(400).json({ message: "Please provide the product id" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success:false, message: "Something went wrong" });
  }
};
exports.fetchProductDetails5 = async (req, res) => {
  const id = req.query.id ? { _id: req.query.id } : {};
  const referenceID = req.query.referenceID ? req.query.referenceID : "";
  let teamBuy = req.query.teamBuy ? req.query.teamBuy : "false";
  let args = {};
  let teamExpired = "false";
  if (teamBuy == "true" && referenceID != "") {
    //Validate if team reference ID is valid
    const isTeamValid = await Teams.findById(referenceID).select(
      "totalRequired currentRequired status owner members createdAt type"
    );
    if (isTeamValid && isTeamValid.type == "View") {
      const alreadyMember = isTeamValid.members.findIndex(
        (x) => x == req.user._id
      );
      if (alreadyMember > -1) {
        teamBuy = "false";
      } else {
        args = {
          $push: {
            members: req.user._id,
          },
        };
      }
      if (isTeamValid.createdAt < Date.now() - 24 * 60 * 60 * 1000) {
        args = { status: "Cancelled" };
        teamExpired = "true";
      }
      if (teamBuy == "true" && isTeamValid.currentRequired < 1) {
        teamBuy = "false";
      }
      if (teamBuy == "true" && isTeamValid.currentRequired < 2) {
        args = { ...args, status: "Closed" };
      }
    } else {
      teamBuy = "false";
    }
  }
  //Fetch Product Variant details
  if (id) {
    /* TO DO: Remove if we want to show product variants in the product details
     const productVariants = await ProductVariant.find(
      {
        product: req.query.id,
      },
      { product: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    ).populate({ path: "variations", select: ["name", "value"] });*/
    Product.findOne(
      { ...id },
      {
        updatedAt: 0,
        createdAt: 0,
        __v: 0,
        createdBy: 0,
      }
    )
      // .populate("options")
      // .populate("variants.variations")
      // .populate("seller")
      //.populate({ path: "variants", select: ["name"] })
      .populate({ path: "category", select: ["name"] })
      .populate({ path: "attributes", select: ["name", "value"] })
      // .populate("attributes")
      /*  .populate({
      path: "seller",
      select: ["username"],
      populate: { path: "user", select: ["_id"] },
    }) */
      .exec((error, product) => {
        if (error)
          return res.status(400).json({
            error,
          });
        if (product) {
          //Limit the product views to show.
          let limitedReviews = product.reviews.reverse().slice(0, 5);
          product.reviews = limitedReviews;

          // Create history record for product view
          const productViews = ProductViewHistory.create({
            product: product._id,
            viewed_by: req.user._id,
            category: product.category,
            view_date: new Date(),
          });
          //Update team record in case reference ID and team buy are there.
          //TO DO: Check if team is expired or closed.
          if (teamBuy == "true" && teamExpired == "false") {
            Teams.findByIdAndUpdate(
              referenceID,
              { ...args, $inc: { currentRequired: -1 } },
              { new: true }
            ).exec();
          }
          if (teamBuy == "true" && teamExpired == "true") {
            Teams.findByIdAndUpdate(
              referenceID,
              { ...args },
              { new: true }
            ).exec();
          }

          Product.findOneAndUpdate(
            { _id: product._id },
            { $inc: { views: 1 } },
            { new: true }
          ).exec();
          return res.status(200).json({ product });
          //return res.status(200).json({ product, productVariants });
        } else {
          return res
            .status(400)
            .json({ message: "not able to find the product" });
        }
      });
  } else {
    return res.status(400).json({ message: "Please provide the product id" });
  }
};

/***************************************
 * 
 * 
 * 
  Product Search methods - Start here
 * 
 * 
 * 
***************************************/
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
exports.getProducts = (req, res) => {
  const category = req.body.category
    ? {
        // "category.slug": req.query
        //{
        // $regex: req.query.searchKeyword,
        // $options: "i",
        //},
        //   { $in: [req.query.searchKeyword] },
        "cat.name": { $in: req.body.category },
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
  let limit = req.query.limit ? parseInt(req.query.limit) : 250;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;
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
    } else if (key === "brand") {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = { $in: req.body.filters[key] };
      }
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
        findArgs[key] = { $in: req.body.filters[key] };
      }
    }
  }
  console.log("Args are " + JSON.stringify(findArgs));
  Product.aggregate([
    {
      $facet: {
        categorizedByCategories: [
          {
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $match: {
              $and: [
                { $or: [{ ...searchKeyword }, { ...searchKeyword1 }] },
                findArgs,
                category,
              ],
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
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $match: {
              $and: [
                { $or: [{ ...searchKeyword }, { ...searchKeyword1 }] },
                findArgs,
                category,
              ],
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
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $match: {
              $and: [
                { $or: [{ ...searchKeyword }, { ...searchKeyword1 }] },
                findArgs,
                category,
              ],
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
            $lookup: {
              from: Category.collection.name,
              localField: "category",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $match: {
              $and: [
                { $or: [{ ...searchKeyword }, { ...searchKeyword1 }] },
                findArgs,
                category,
                //    { category: "61bdebdd8a53da034cc547cb" },
              ],
            },
          },
          {
            $project: {
              name: 1,
              price: 1,
              rating: 1,
              productImages: 1,
              seller: 1,
              category: 1,
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
exports.getProductFilters2 = (req, res) => {
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
exports.getProducts1 = (req, res) => {
  let findArgs = {};
  const category = req.body.category
    ? {
        "cat.name": { $in: req.body.category },
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
  const searchKeyword1 = req.query.tag ? { tags: req.query.tag } : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowestprice"
      ? { price: 1 }
      : req.query.sortOrder === "highestprice"
      ? { price: -1 }
      : req.query.sortOrder === "nameascending"
      ? { slug: 1 }
      : { slug: -1 }
    : { _id: -1 };
  let limit = req.query.limit ? parseInt(req.query.limit) : 250;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;

  let select = req.body.select ? req.body.select : "";

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
    } else if (key === "brand") {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = { $in: req.body.filters[key] };
      }
    } else if (key === "options") {
      let query2 = [];
      for (let x in req.body.filters[key]) {
        if (req.body.filters[key][x].length > 0) {
          query2.push({
            $and: [
              { "options.varationName": x },
              {
                "options.varationValue": {
                  $in: req.body.filters[key][x],
                },
              },
            ],
          });
        }
        console.log(x + "Query2 is" + JSON.stringify(req.body.filters[key][x]));
      }
      findArgs["$and"] = query2;
    } else if (key === "price") {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else if (key === "category") {
      findArgs[key] = {
        "cat.name": { $in: [req.body.filters[key]] },
      };
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = { $in: req.body.filters[key] };
      }
    }
  }
  //findArgs = { category: { "cat.name": "MacBook" } };
  var findArgs1 = [{ ...searchKeyword1 }, findArgs];
  if (req.body.category && req.body.category.length > 0) {
    findArgs1.push(category);
  }
  const catLookUpObject = {
    $lookup: {
      from: Category.collection.name,
      localField: "category",
      foreignField: "_id",
      as: "cat",
    },
  };
  console.log("Args are " + JSON.stringify(findArgs1));
  Product.aggregate([
    {
      $facet: {
        categorizedByCategories: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $group: {
              _id: "$cat.name",
              count: { $sum: 1 },
            },
          },

          { $sort: { count: -1, _id: -1 } },
        ],
        categorizedByBrand: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $group: {
              _id: "$brand",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: -1 } },
        ],
        categorizedByPriceAuto: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
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
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $project: {
              name: 1,
              price: 1,
              rating: 1,
              productImages: 1,
              seller: 1,
              category: 1,
              tags: 1,
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
    //({ tags: req.query.tag })
    //.select("tags")
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
};
exports.getProducts2 = (req, res) => {
  let findArgs = {};
  const category = req.body.category
    ? { "cat.name": { $in: req.body.category } }
    : {};
  const searchKeyword1 = req.query.tag ? { tags: req.query.tag } : {};
  const sortOrder = req.query.sort
    ? req.query.sort === "lowestprice"
      ? { price: 1 }
      : req.query.sort === "highestprice"
      ? { price: -1 }
      : req.query.sort === "nameascending"
      ? { slug: 1 }
      : { slug: -1 }
    : { _id: -1 };

  let limit = req.query.limit ? parseInt(req.query.limit) : 250;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;

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
    } else if (key === "brand") {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = { $in: req.body.filters[key] };
      }
    } else if (key === "options") {
      let query2 = [];
      for (let x in req.body.filters[key]) {
        if (req.body.filters[key][x].length > 0) {
          query2.push({
            $and: [
              { "options.varationName": x },
              {
                "options.varationValue": {
                  $in: req.body.filters[key][x],
                },
              },
            ],
          });
        }
        console.log(x + "Query2 is" + JSON.stringify(req.body.filters[key][x]));
      }
      findArgs["$and"] = query2;
    } else if (key === "price") {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }
    } else if (key === "category") {
      findArgs[key] = {
        "cat.name": { $in: [req.body.filters[key]] },
      };
    } else {
      if (req.body.filters[key].length > 0) {
        findArgs[key] = { $in: req.body.filters[key] };
      }
    }
  }
  //findArgs = { category: { "cat.name": "MacBook" } };
  var findArgs1 = [{ ...searchKeyword1 }, findArgs];
  if (req.body.category && req.body.category.length > 0) {
    findArgs1.push(category);
  }
  const catLookUpObject = {
    $lookup: {
      from: Category.collection.name,
      localField: "category",
      foreignField: "_id",
      as: "cat",
    },
  };
  console.log("Args are " + JSON.stringify(findArgs1));
  Product.aggregate([
    {
      $facet: {
        categorizedByCategories: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $group: {
              _id: "$cat.name",
              count: { $sum: 1 },
            },
          },

          { $sort: { count: -1, _id: -1 } },
        ],
        categorizedByBrand: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $group: {
              _id: "$brand",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: -1 } },
        ],
        categorizedByPriceAuto: [
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
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
          catLookUpObject,
          {
            $lookup: {
              from: "ProductVariantOption",
              localField: "options",
              foreignField: "_id",
              as: "options",
            },
          },
          {
            $match: {
              $and: findArgs1,
            },
          },
          {
            $project: {
              name: 1,
              price: 1,
              rating: 1,
              productImages: 1,
              seller: 1,
              category: 1,
              tags: 1,
            },
          },
          { $skip: skip },
          {
            $limit: limit,
          },

          { $sort: sortOrder },
        ],
      },
    },
  ])
    //({ tags: req.query.tag })
    //.select("tags")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found" + err,
        });
      }
      if (data) {
        const size = data[0].filteredProducts
          ? data[0].filteredProducts.length
          : 0;
        res.json({
          size: size,
          data,
        });
      }
    });
};

/***************************************
 * 
 * 
 * 
  Product Delete methods - Start here
 * 
 * 
 * 
***************************************/
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
/*
exports.getProductFilters = (req, res) => {
  let order = req.query.order ? slugify(req.query.order) : "slug";x`
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
