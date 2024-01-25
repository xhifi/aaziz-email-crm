const { StatusCodes } = require("http-status-codes");
const CustomError = require("./CustomError");

module.exports = class BadRequest extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
};
