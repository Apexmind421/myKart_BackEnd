const Category = require("../models/category");
const slugify = require("slugify");
const DatauriParser = require("datauri/parser");
const path = require("path");
const parser = new DatauriParser();
const { uploader } = require("../config/cloudinary.config");
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
  const categoryObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
  };
  /*
    if(req.file){
        categoryObj.categoryImage = process.env.API + '/public/' + req.file.filename;
    }
*/
  if (req.files) {
    const catFile = parser.format(
      path.extname(req.files[0].originalname).toString(),
      req.files[0].buffer
    );
    const uploadResult = await uploader.upload(catFile.content);
    categoryObj.categoryImage = uploadResult.secure_url;
    // console.log("I am inside the create Category " + uploadResult.secure_url);
  }

  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }

  //console.log("I am in the category outside save");
  const _cat = new Category(categoryObj);
  _cat.save((error, category) => {
    //console.log("I am here in the category save");
    if (error) return res.status(400).json({ error });
    if (category) return res.status(201).json({ category });
  });
};

exports.fetchCategory = (req, res) => {
  Category.find({}).exec((error, categories) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (categories) {
      res.status(200).json({ size: categories.length, categories });
    }
  });
};

exports.fetchCategories = (req, res) => {
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
  Category.find(id).exec((error, categories) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (categories) {
      const categoryList = createCategories(categories);
      res.status(200).json({ size: categoryList.length, categoryList });
    }
  });
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

exports.modifyCategories = async (req, res) => {
  try {
    const id = req.query.id;
    let parentId = 0;
    const { name, type } = req.body;
    parentId = req.body.parentId;
    console.log(req.query.id);
    if (!id) {
      return res.status(400).json({ message: "ID is missing" });
    }
    let categoryObj = await Category.findOne({ _id: id });
    console.log("Category is " + parentId);
    if (name) {
      categoryObj.name = name;
      categoryObj.slug = slugify(name);
    }
    if (type) {
      categoryObj.type = type;
    }
    if (parentId != 0) {
      console.log("Category is 1 " + parentId); //TODO: Not working
      categoryObj.parentId = parentId;
    }

    if (req.files && req.files.length > 0) {
      const catFile = parser.format(
        path.extname(req.files[0].originalname).toString(),
        req.files[0].buffer
      );
      const uploadResult = await uploader.upload(catFile.content);
      categoryObj.categoryImage = uploadResult.secure_url;
      console.log("I am inside the create Category " + uploadResult.secure_url);
    } // TODO: Delete old image from cloudinary

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      categoryObj,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedCategory });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" + err });
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

exports.deleteCategories = async (req, res) => {
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
  Category.deleteMany(id).exec((error, categories) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (categories) {
      // const categoryList = createCategories(categories);
      res.status(200).json({ message: "Categories removed" });
    }
  });
  //TODO: Delete category images from Cloudinary
};
