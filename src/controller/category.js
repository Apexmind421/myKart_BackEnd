const Category = require("../models/category");
const slugify = require("slugify");
const DatauriParser = require("datauri/parser");
const path = require("path");
const parser = new DatauriParser();
const { uploader } = require("../config/cloudinary.config");

const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  for (let i of category) {
    categoryList.push({
      _id: i._id,
      name: i.name,
      slug: i.slug,
      categoryImage: i.categoryImage,
      // parentId: i.parentId,
      type: i.type,
      children: createCategories(categories, i._id),
    });
  }
  return categoryList;
}

exports.addCategory = async (req, res) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: slugify(req.body.name),
    };
    /*
    if(req.file){
        categoryObj.categoryImage = process.env.API + '/public/' + req.file.filename;
    }

  if (req.files) {
    const catFile = parser.format(
      path.extname(req.files[0].originalname).toString(),
      req.files[0].buffer
    );
    const uploadResult = await uploader.upload(catFile.content);
    categoryObj.categoryImage = uploadResult.secure_url;
    // console.log("I am inside the create Category " + uploadResult.secure_url);
  }
*/

    const imageUpload = (path) => cloudinaryUploadImg(path, "images");
    const files = req.files;
    for (i in files) {
      const { path } = files[i];
      const newpath = await imageUpload(path);
      if (i == 0) {
        categoryObj.categoryImage = newpath.url;
      }
      if (i == 1) {
        categoryObj.banner = newpath.url;
      }
      //fs.unlinkSync(path);
    }
    if (req.body.parentId) {
      categoryObj.parentId = req.body.parentId;
    }
    const _cat = new Category(categoryObj);
    const createCategory = await _cat.save();
    if (createCategory) {
      return res
        .status(201)
        .json({ success: true, message: "added category", data: category });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not create category" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.fetchCategories = async (req, res) => {
  try {
    const findArgs = req.query.id
      ? {
          $or: [
            { _id: req.query.id },
            {
              parentId: req.query.id,
            },
          ],
        }
      : {};
    const showHierarchy = req.query.showHierarchy ? true : false;
    const categories = await Category.find(findArgs);
    if (categories) {
      let categoryList = categories;
      if (showHierarchy) {
        categoryList = await createCategories(categories);
      }
      return res.status(200).json({
        success: true,
        message: "fetched categories",
        data: categoryList,
        size: categoryList.length,
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

exports.modifyCategories = async (req, res) => {
  try {
    const id = req.query.id;
    const { name, type, order } = req.body;
    let parentId = 0;
    parentId = req.body.parentId;
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
    let categoryObj = await Category.findById(id);
    if (!categoryObj) {
      return res
        .status(400)
        .json({ success: false, message: "category not exist" });
    }
    if (name) {
      categoryObj.name = name;
      categoryObj.slug = slugify(name);
    }
    if (order) {
      categoryObj.order = order;
    }
    if (type) {
      categoryObj.type = type;
    }
    if (parentId != 0) {
      //TODO: Not working
      categoryObj.parentId = parentId;
    }
    /*
    if (req.files && req.files.length > 0) {
      const catFile = parser.format(
        path.extname(req.files[0].originalname).toString(),
        req.files[0].buffer
      );
      const uploadResult = await uploader.upload(catFile.content);
      categoryObj.categoryImage = uploadResult.secure_url;
      console.log("I am inside the create Category " + uploadResult.secure_url);
    } */

    const imageUpload = (path) => cloudinaryUploadImg(path, "images");
    const files = req.files;
    for (i in files) {
      const { path } = files[i];
      const newpath = await imageUpload(path);

      if (i == 0) {
        categoryObj.categoryImage = newpath.url;
      }
      if (i == 1) {
        categoryObj.banner = newpath.url;
      }

      //fs.unlinkSync(path);
    } // TODO: Delete old image from cloudinary

    const updatedCategory = await Category.findByIdAndUpdate(id, categoryObj, {
      new: true,
    }); //TO DO: use save rather than update
    if (updatedCategory) {
      return res
        .status(200)
        .json({ success: true, message: "category updated sucessfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not update category" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.deleteCategories = async (req, res) => {
  try {
    const id = req.query.id
      ? {
          $or: [
            { _id: req.query.id },
            {
              parentId: req.query.id,
            },
          ],
        }
      : {};
    const result = await Category.deleteMany(id);

    if (result) {
      // const categoryList = createCategories(categories);
      return res
        .status(202)
        .json({ success: true, message: "Categories removed" });
    } else {
      return res.status(400).json({
        success: false,
        message: "Could not delete category",
      });
    }
    //TODO: Delete category images from Cloudinary
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/*
exports.fetchCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    if (categories) {
      res.status(200).json({
        success: true,
        message: "fetched categories",
        data: categories,
        size: categories.length,
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


exports.modifyCategories1 = async (req, res) => {
  const { _id, name, parentId, type } = req.body;
  const updatedCategories = [];
  if (name instanceof Array) {
    for (let i = 0; i < name.length; i++) {
      const category = {
        name: name[i],
        type: type[i],
      };
      if (parentId[i] !== "") {
        category.parentId = parentId[i];
      }

      const updatedCategory = await Category.findOneAndUpdate(
        { _id: _id[i] },
        category,
        { new: true }
      );
      updatedCategories.push(updatedCategory);
    }
    return res.status(201).json({ updateCategories: updatedCategories });
  } else {
    const category = {
      name,
      type,
    };
    if (parentId !== "") {
      category.parentId = parentId;
    }
    const updatedCategory = await Category.findOneAndUpdate({ _id }, category, {
      new: true,
    });
    return res.status(201).json({ updatedCategory });
  }
};

exports.deleteCategories1 = async (req, res) => {
  const ids = req.body.payload;

  const deletedCategories = [];
  for (let i = 0; i < ids.length; i++) {
    const deleteCategory = await Category.findOneAndDelete({ _id: ids[i]._id });
    deletedCategories.push(deleteCategory);
  }

  if (deletedCategories.length == ids.length) {
    res.status(201).json({ message: "Categories removed" });
  } else {
    res.status(400).json({ message: "Something went wrong" });
  }
};
*/
