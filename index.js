const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const options = {
  key: fs.readFileSync("./ssl/api_saffiullahfahim_me.key"),
  cert: fs.readFileSync("./ssl/api_saffiullahfahim_me.crt"),
  ca: fs.readFileSync("./ssl/api_saffiullahfahim_me.ca-bundle"),
};

// app init
const app = express();
const server = https.createServer(options, app);
dotenv.config();

// socket
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
global.io = io;

// database connection
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successful!"))
  .catch((err) => console.log(err));

// core
app.use(cors());

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

server.listen(9443, () => {
  console.log(`app listening to port ${9756}`);
});

// http server
const httpServer = http.createServer(app);

httpServer.listen(9080);
