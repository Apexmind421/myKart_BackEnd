const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
//routes
const authRoutes = require("./routes/auth");
const adminAuthRoutes = require("./routes/admin/auth");
const catRoutes = require("./routes/category");
const prodRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const favoriteRoutes = require("./routes/favorite");
const pageRoutes = require("./routes/admin/page");
const addressRoutes = require("./routes/address");
const initialDataRoutes = require("./routes/admin/initialData");
const orderRoutes = require("./routes/order");

const cors = require("cors");

//environment variable
env.config();

//MongoDB Congifuration
//mongodb+srv://dbadmin:<password>@cluster0.0ozae.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.0ozae.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  });

//To parse JSON on response in Post. Acts as mediator
app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "/uploads/")));
app.use("/api", authRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", catRoutes);
app.use("/api", prodRoutes);
app.use("/api", cartRoutes);
app.use("/api", pageRoutes);
app.use("/api", addressRoutes);
app.use("/api", initialDataRoutes);
app.use("/api", orderRoutes);
app.use("/api", favoriteRoutes);

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
