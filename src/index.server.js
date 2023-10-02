const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { rateLimit } = require("express-rate-limit");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const router= require("./routes");

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
// Sanitize user input
app.use(mongoSanitize());
app.use("/api",router);
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
