const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

//routes
const authRoutes = require("./routes/auth");
const adminAuthRoutes = require("./routes/admin/auth");
const catRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
//onst productAdminRoutes = require("./routes/admin/product");
const historyRoutes = require("./routes/productViews");
const cartRoutes = require("./routes/cart");
const favoriteRoutes = require("./routes/favorite");
const pageRoutes = require("./routes/admin/page");
const addressRoutes = require("./routes/address");
const initialDataRoutes = require("./routes/admin/initialData");
const orderRoutes = require("./routes/order");
const returnRequestRoutes = require("./routes/returnRequest");
const questionRoutes = require("./routes/questions");
const supportRoutes = require("./routes/tickets");
const flashSaleRoutes = require("./routes/flashSale");
const couponRoutes = require("./routes/coupon");
const attributeRoutes = require("./routes/attribute");
const dealRoutes = require("./routes/deals");
const teamRoutes = require("./routes/teams");
const { cloudinaryConfig } = require("./config/cloudinary.config");
const cors = require("cors");

//environment variable
env.config();

//MongoDB Congifuration
//mongodb+srv://dbadmin:<password>@cluster0.0ozae.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.0ozae.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  });

//To parse JSON on response in Post. Acts as mediator
app.use(cors());
app.use(express.json());
app.use("*", cloudinaryConfig);
app.use("/public", express.static(path.join(__dirname, "/uploads/")));
app.use("/api", authRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", catRoutes);
app.use("/api", productRoutes);
app.use("/api", dealRoutes);
app.use("/api", cartRoutes);
app.use("/api", attributeRoutes);
app.use("/api", pageRoutes);
app.use("/api", addressRoutes);
app.use("/api", initialDataRoutes);
app.use("/api", orderRoutes);
app.use("/api", returnRequestRoutes);
app.use("/api", questionRoutes); //Added Questions Route
app.use("/api", flashSaleRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", couponRoutes);
app.use("/api", teamRoutes);
app.use("/api", historyRoutes);
app.use("/api", supportRoutes);

app.use(notFound);
app.use(errorHandler);

// Listen to port in environment file
app.listen(process.env.PORT, () => {
  console.log(`Server has been started and listening on ${process.env.PORT}`);
});

/*
//GET API call
app.get('/',(req,res,next)=>{
    res.status(200).json({
        message: 'Sucessful response from server'
    });
});

//POST API call
app.post('/data',(req,res,next)=>{
    res.status(200).json({
        message: req.body
    });

});
*/
