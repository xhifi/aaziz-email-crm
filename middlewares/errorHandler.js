const { StatusCodes } = require("http-status-codes");
const { logNetworkErr, logSystemErr } = require("../errors/errEventHandler");

function findStatusCode(digit) {
  return StatusCodes.hasOwnProperty(digit) ? StatusCodes[digit] : "Not found";
}

module.exports = errorHandler = (err, req, res, next) => {
  console.log(err);
  if (findStatusCode(err.statusCode)) {
    logNetworkErr({ code: err.statusCode, method: req.method, ip: req.ip || req.connection.remoteAddress, msg: err.message });
  } else {
    logSystemErr({ code: "SYS", msg: err.message });
  }

  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong on the server",
  };

  // res.status(defaultError.statusCode).json({ msg: err });
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};
