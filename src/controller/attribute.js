const Attribute = require("../models/attribute");

exports.addAttribute = (req, res) => {
  if (req.body.attributes) {
    Attribute.findOne(req.body.attributes).exec((error, attribute) => {
      if (error)
        return res.status(400).json({
          message: "Product Option is not registered",
        });
      if (attribute) {
        return res.status(401).json({
          message: "Attribute is already registered",
        });
      } else {
        const _attribute = new Attribute(req.body.attributes);
        _attribute.save((err, data) => {
          //console.log("Data is " + JSON.stringify(data));
          if (err) {
            //  console.log("Error is " + JSON.stringify(err));
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
    });
  }
};
exports.fetchAttribute = (req, res) => {
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
exports.deleteAttribute = (req, res) => {
  if (req.body.attributes) {
    Attribute.findOne(req.body.attributes).exec((error, attribute) => {
      if (error)
        return res.status(400).json({
          message: "Product Option is not registered",
        });
      if (attribute) {
        return res.status(401).json({
          message: "Attribute is already registered",
        });
      } else {
        const _attribute = new Attribute(req.body.attributes);
        _attribute.save((err, data) => {
          //console.log("Data is " + JSON.stringify(data));
          if (err) {
            //  console.log("Error is " + JSON.stringify(err));
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
    });
  }
};
