require("dotenv").config();
const { PROCESS_PORT } = process.env;
const express = require("express");
require("express-async-errors");

const app = express();
app.use(express.json());
app.use(require("cors")());

app.use("/api/s", require("./routes/subscribers"));
app.use("/api/t", require("./routes/tags"));

app.use(require("./middlewares/errorHandler"));
app.use(require("./middlewares/catchAllException"));

app.listen(PROCESS_PORT, (err) => {
  if (err) throw new Error(err);
  console.log(`http://127.0.0.1:${PROCESS_PORT}`);
});
