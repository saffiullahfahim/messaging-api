const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");

const message = require("./models/message");
const user = require("./models/user");

const options = {
  key: fs.readFileSync("./ssl/api_saffiullahfahim_me.key"),
  cert: fs.readFileSync("./ssl/api_saffiullahfahim_me.crt"),
  ca: fs.readFileSync("./ssl/api_saffiullahfahim_me.ca-bundle"),
};

// app init
const app = express();
const server = https.createServer(options, app);
dotenv.config();

// users
const User = {
  Marjan: "Fahim",
  Fahim: "Marjan",
};

// socket
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  // console.log(socket.handshake.auth.name);
  let data = await (await message.find({}).sort("-createdAt").limit(30)).reverse();

  let findUser = await user.find({ name: socket.handshake.auth.name });
  if (findUser.length) {
    await user.findByIdAndUpdate(findUser[0]._id, {
      name: socket.handshake.auth.name,
    });
  } else {
    const newUser = new user({ name: socket.handshake.auth.name });
    const result = await newUser.save();
  }

  let activeUser = await user.find({ name: User[socket.handshake.auth.name] });
  socket.emit("active", activeUser.length ? activeUser[0].updatedAt : "");

  socket.emit("data", {
    message: data,
  });

  socket.on("send", async (data) => {
    const newMassage = new message(data);

    const result = await newMassage.save();

    let findUser = await user.find({ name: socket.handshake.auth.name });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: socket.handshake.auth.name,
      });
    } else {
      const newUser = new user({ name: socket.handshake.auth.name });
      const result = await newUser.save();
    }

    io.emit("newData", result);
    let activeUser = await user.find({
      name: User[socket.handshake.auth.name],
    });
    socket.emit("active", activeUser.length ? activeUser[0].updatedAt : "");
  });

  socket.on("typing", async (data) => {
    let findUser = await user.find({ name: socket.handshake.auth.name });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: socket.handshake.auth.name,
      });
    } else {
      const newUser = new user({ name: socket.handshake.auth.name });
      const result = await newUser.save();
    }

    io.emit("typing", socket.handshake.auth.name);
    // let activeUser = await user.find({
    //   name: User[socket.handshake.auth.name],
    // });
    // socket.emit("active", activeUser.length ? activeUser[0].updatedAt : "");
  })

  socket.conn.on("packet", async ({ type, data }) => {
    let findUser = await user.find({ name: socket.handshake.auth.name });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: socket.handshake.auth.name,
      });
    } else {
      const newUser = new user({ name: socket.handshake.auth.name });
      const result = await newUser.save();
    }

    let activeUser = await user.find({
      name: User[socket.handshake.auth.name],
    });
    socket.emit("active", activeUser.length ? activeUser[0].updatedAt : "");
  });

  socket.conn.on("close", async (reason) => {
    let findUser = await user.find({ name: socket.handshake.auth.name });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: socket.handshake.auth.name,
      });
    } else {
      const newUser = new user({ name: socket.handshake.auth.name });
      const result = await newUser.save();
    }

    let activeUser = await user.find({
      name: User[socket.handshake.auth.name],
    });
    socket.emit("active", activeUser.length ? activeUser[0].updatedAt : "");
  });
});

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
  console.log(`app listening to port ${9443}`);
});

// http server
const httpServer = http.createServer(app);

httpServer.listen(9080);
