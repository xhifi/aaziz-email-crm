const { StatusCodes } = require("http-status-codes");

module.exports = notFound = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).send({ msg: "Route doesn't exist", err: StatusCodes.NOT_FOUND });
};
