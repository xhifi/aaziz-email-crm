const { StatusCodes } = require("http-status-codes");
const CustomError = require("./CustomError");

module.exports = class NotFound extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
};
