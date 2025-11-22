import logger from "../utils/logger.js";


const errorHandler = (err, req, res, next) => {
  logger.error(`❌Something went wrong  ${err.message}`, {
    stack: err.stack,
  });
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    status: false,
  });
};
export default errorHandler;
