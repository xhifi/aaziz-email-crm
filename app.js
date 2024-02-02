require("dotenv").config();
const { PROCESS_PORT } = process.env;
const express = require("express");
require("express-async-errors");

const app = express();
app.use(express.json());
app.use(require("cors")());
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

app.use("/api/s", require("./routes/subscribers"));
app.use("/api/t", require("./routes/tags"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/templates", require("./routes/templates"));

app.use(require("./middlewares/errorHandler"));
app.use(require("./middlewares/catchAllException"));

const server = app.listen(PROCESS_PORT, (err) => {
  if (err) throw new Error(err);
  console.log(`http://127.0.0.1:${PROCESS_PORT}`);
});

const io = require("socket.io")(server);

let connectedClients = new Set();
const onConnection = (socket) => {
  console.log("connected: " + socket.id);
  connectedClients.add({ socketId: socket.id });

  io.emit("CONNECTED_CLIENTS", connectedClients.size);

  socket.on("disconnect", () => {
    console.log(`disconnected: ${socket.id}`);
    connectedClients.delete({ socketId: socket.id });

    io.emit("CONNECTED_CLIENTS", connectedClients.size);
  });
};

io.on("connection", onConnection);
