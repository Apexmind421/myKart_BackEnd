const Settings = require("../models/settings");
const { logger } = require("..//config/logger");

exports.addSetting = async (req, res) => {
  try {
    if (req.body.variable && req.body.value) {
      const settingObj = {
        variable: req.body.variable,
        value: req.body.value,
      };
      const setting = await Settings.create(settingObj);
      if (setting) {
        return res.status(201).json({
          success: true,
          message: "Setting Created",
          data: setting,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not create setting" });
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
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find().select("variable");
    if (settings) {
      return res
        .status(201)
        .json({ success: true, message: "Setting Fetched", data: settings });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "could not fetch Setting" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.getSettingById = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      logger.error("getSettingById::: ");
      return res.status(400).json({ success: false, message: "Missing input" });
    }
    const findSetting = await Settings.findById(id);
    if (findSetting) {
      return res
        .status(200)
        .json({ success: true, message: "Setting Fetched", data: findSetting });
    } else {
      logger.error("getSettingById::: ");
      return res
        .status(400)
        .json({ success: false, message: "could not fetch Setting" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
/*
exports.getSettingById = async (req, res) => {
  try {
    //1. Set custom filter condition
    let filter = {};

    //Add status in filter
    if (req.params.status) {
      filter = { ...filter, status: req.params.status };
    } else {
      filter = { ...filter, status: "Open" };
    }

    //Add product in filter
    if (req.params.product) {
      filter = { ...filter, product: req.params.product };
    }

    //Add currentRequired in filter
    if (req.params.currentRequired) {
      filter = {
        ...filter,
        currentRequired: { $lt: req.params.currentRequired },
      };
    } else {
      filter = { ...filter, currentRequired: 1 };
    }

    //Add owner in filter based on role
    if (req.user.role != admin) {
      filter = { ...filter, owner: req.user._id };
    }

    //2. Filter Team table with filter condition
    const teams = Teams.find(filter);
    if (teams) {
      return res.status(200).json({
       success:true,
        mesage: "Fetched teams successfully",
        result: teams,
      });
    } else {
      return res
        .status(404)
        .json({ success:false, mesage: "No Teams available" });
    }
  } catch (error) {
    console.log("Catch Error for getTeams is::: " + error.message);
    return res
      .status(500)
      .json({ success:false, mesage: "Something went wrong" });
  }
};
*/
