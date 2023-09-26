const Teams = require("../models/teams");
const Order = require("../models/order");
const Product = require("../models/product");

exports.getTeams = async (req, res) => {
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
        type: "success",
        mesage: "Fetched teams successfully",
        result: teams,
      });
    } else {
      return res
        .status(404)
        .json({ type: "error", mesage: "No Teams available" });
    }
  } catch (error) {
    console.log("Catch Error for getTeams is::: " + error.message);
    return res
      .status(500)
      .json({ type: "error", mesage: "Something went wrong" });
  }
};
