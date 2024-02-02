const Emitter = require("events");
const { dateTimeMs } = require("../utils/date");
const errorEmitter = new Emitter();

const fs = require("fs");
const util = require("util");
const appendFileAsync = util.promisify(fs.appendFileSync);
const path = require("path");
const networkLogFile = "network.error.log";
const networkLogFilePath = path.resolve(process.cwd(), "logs", networkLogFile);
const systemLogFile = "sys.error.log";
const systemLogFilePath = path.resolve(process.cwd(), "logs", systemLogFile);

errorEmitter.on("SYS", ({ code, msg }) => {
  const { verboseTime } = dateTimeMs();

  const logString = `${verboseTime}\t${code}\t${msg}`;
  appendFileAsync(systemLogFilePath, logString + "\n");

  console.error(`system error: `, logString);
});

errorEmitter.on("NETWORK", ({ code, msg, method, ip, id }) => {
  const { verboseTime } = dateTimeMs();

  const logString = `${verboseTime}\t${code}\t${ip}\t${id}\t${method}\t${msg}`;
  appendFileAsync(networkLogFilePath, logString + "\n");

  console.error(`network error: `, logString);
});

const logSystemErr = ({ code, msg }) => {
  errorEmitter.emit("SYS", { code, msg });
};
const logNetworkErr = (obj) => {
  errorEmitter.emit("NETWORK", { ...obj });
};

module.exports = { errorEmitter, logSystemErr, logNetworkErr };
