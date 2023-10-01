const winston = require("winston");
const { Console } = require("winston/lib/winston/transports");
//const DailyRotateFile =
require("winston-daily-rotate-file");
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});
const transport1 = new winston.transports.File({
  filename: "./logs/example.log",
});
/*  Console({
    stderrLevels: ["error"],
  }),*/
const transport = new winston.transports.DailyRotateFile({
  filename: "./logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});
transport.on("rotate", function (oldFilename, newFilename) {
  // TO DO: call function like upload to s3 or on cloud
  Console.log("oldFilename " + oldFilename);
  Console.log("newFilename " + newFilename);
});

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    enumerateErrorFormat(),
    //winston.format.colorize(),
    //  winston.format.splat(),
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.align(),
    winston.format.printf(
      (info) => `${info.level}:  ${[info.timestamp]}: ${info.message}`
    )
  ),
  transports: [transport],
});

module.exports = { logger };

/*const winston = require("winston");

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    enumerateErrorFormat(),

    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(
      (info) =>
        `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  
  ),
  transports: [
    new winston.transports.File({
      filename: "../logs/example.log",
    }),
  
  ],
});

module.exports = { logger };*/
