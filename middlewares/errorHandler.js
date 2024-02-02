const { StatusCodes } = require("http-status-codes");
const { logNetworkErr, logSystemErr } = require("../errors/errEventHandler");

function findStatusCode(digit) {
  return StatusCodes.hasOwnProperty(digit) ? StatusCodes[digit] : "Not found";
}

module.exports = errorHandler = (err, req, res, next) => {
  console.log(err);

  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong on the server",
  };

  logNetworkErr({
    code: defaultError.statusCode,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    id: req.id,
    msg: err.message,
  });

  // res.status(defaultError.statusCode).json({ msg: err });
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};
