const Attribute = require("../models/attribute");

exports.addAttribute = async (req, res) => {
  try {
    if (req.body.attributes) {
      const attribute = await Attribute.findOne(req.body.attributes);
      if (attribute) {
        return res.status(401).json({
          message: "Attribute is already registered",
        });
      } else {
        const _attribute = await Attribute.create(req.body.attributes);
        if (_attribute) {
          return res.status(201).json({
            success: true,
            message: "Attribute created successfully",
            data: _attribute,
          });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Could not add attribute" });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.fetchAttribute = async (req, res) => {
  try {
    const getAttribute = await Attribute.find();
    if (getAttribute) {
      return res.status(200).json({
        success: true,
        message: "fetched attributes",
        size: data.length,
        data: getAttribute,
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
exports.deleteAttribute = async (req, res) => {
  try {
    const optionId = req.query.id;
    if (optionId) {
      const result = await Attribute.deleteOne({ _id: optionId });
      if (result) {
        return res
          .status(202)
          .json({ success: true, message: "deleted attribute" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not delete attribute" });
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
