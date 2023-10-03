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
      return res
        .status(201)
        .json({success:true, mesage: "Setting Created", setting });
    } else {
      logger.error("addSetting::: ");
      return res.status(400).json({ error: "missing required inputs" });
    }
  } catch (error) {
    logger.error("addSetting::: " + error.message);
    return res
      .status(500)
      .json({ success:false, mesage: "Something went wrong" });
  }
};
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find().select("variable");
    if (settings) {
      return res
        .status(201)
        .json({success:true, mesage: "Setting Fetched", settings });
    } else {
      logger.error("getAllSettings::: ");
      return res.status(400).json({ error: "could not fetch Setting" });
    }
  } catch (error) {
    logger.error("getAllSettings::: " + error.message);
    return res
      .status(500)
      .json({ success:false, mesage: "Something went wrong" });
  }
};
exports.getSettingById = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      logger.error("getSettingById::: ");
      return res.status(400).json({ error: "missing required inputs" });
    }
    const findSetting = await Settings.findById(id);
    if (findSetting) {
      return res
        .status(201)
        .json({success:true, mesage: "Setting Fetched", findSetting });
    } else {
      logger.error("getSettingById::: ");
      return res.status(400).json({ error: "could not fetch Setting" });
    }
  } catch (error) {
    logger.error("getSettingById::: " + error.message);
    return res
      .status(500)
      .json({ success:false, mesage: "Something went wrong" });
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
