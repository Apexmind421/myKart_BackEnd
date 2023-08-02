const ProductViewHistory = require("../models/productViews");

exports.getProductViews = (req, res) => {
  const product = req.query.prodId;
  const category = req.query.catId;
  const user = req.query.userId;
  let args = {};
  if (product) args.product = product;
  if (category) args.category = category;
  if (user) args.viewed_by = user;
  // console.log(JSON.stringify(args));
  ProductViewHistory.find(args)
    /*.populate({
      path: "favoriteItems",
      select: ["name", "price", "productImages"],
    })*/
    .exec((err, data) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send({ size: data.length, data: data });
    });
};
