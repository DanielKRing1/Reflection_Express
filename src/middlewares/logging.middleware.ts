import { Express } from "express";
import morgan from "morgan";
import winston, { format } from "winston";

// CREATE WINSTON LOGGER
const logger = winston.createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf((msg) => {
      return `${msg.timestamp} [${msg.level}] ${msg.message}`;
    })
  ),
  transports: [new winston.transports.Console({ level: "http" })],
});

// CREATE MORGAN LOGGING MIDDLEWARE, USING WINSTON
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);

export default morganMiddleware;
