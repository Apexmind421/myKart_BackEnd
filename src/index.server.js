const express = require("express");
const { successMorganHandler, errorMorganHandler } = require("./config/morgan");
const { logger } = require("./config/logger");
const env = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const router = require("./routes");

const { cloudinaryConfig } = require("./config/cloudinary.config");
const cors = require("cors");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // Set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});

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
    logger.info("MongoDB Server connected");
  });

//To parse JSON on response in Post. Acts as mediator
app.use(cors());
app.use(express.json());
//TO DO: This is added just for render deployment
app.set("trust proxy", 1);
// Use Helmet!
app.use(helmet());
// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);

// MongoDB data sanitization
app.use(mongoSanitize());

//app.use(morgan("dev"));
app.use(successMorganHandler);
app.use(errorMorganHandler);
app.use("*", cloudinaryConfig);
app.use("/public", express.static(path.join(__dirname, "/uploads/")));
app.use("/api", router);
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

/*
// page not found error handling  middleware

app.use("*", (req, res, next) => {
  const error = {
    status: 404,
    message: API_ENDPOINT_NOT_FOUND_ERR,
  };
  next(error);
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

*/
