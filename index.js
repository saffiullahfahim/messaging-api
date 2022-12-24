const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");
const { WebClient, LogLevel, WebClientEvent } = require("@slack/web-api");

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

// slack client
const client = new WebClient(process.env.SLACK_API_KEY);

const getTime = (date) => {
  if (date == undefined) date = new Date().toISOString();
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "BST",
  };
  return new Date(date).toLocaleTimeString("en-US", options) + " $ ";
};

const getBlocks = (u_name, message, time) => {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: u_name,
        emoji: true,
      },
    },
    {
      type: "divider",
    },
    {},
    {
      type: "divider",
    },
    {
      type: "context",
      elements: [
        {
          type: "plain_text",
          text: getTime(time),
          emoji: true,
        },
      ],
    },
  ];
  if (message.substr(0, 4) == "img") {
    blocks[2] = {
      type: "image",
      image_url: message.substr(4),
      alt_text: "emoji",
    };
  } else {
    blocks[2] = {
      type: "section",
      text: {
        type: "plain_text",
        text: message.substr(4),
        emoji: true,
      },
    };
  }

  return blocks;
};

const sendMessage = async (message, time) => {
  const blocks = getBlocks("Marjan", message, time);

  try {
    const result = await client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: "message from ...",
      blocks,
    });

    if (result.ok) {
      console.log(getTime(), "send message to slack");
    } else {
      console.log(getTime(), result);
    }
  } catch (err) {
    console.log(getTime(), err);
  }
};

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
  let data = await (
    await message.find({}).sort("-createdAt").limit(30)
  ).reverse();

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

    if (socket.handshake.auth.name == "Marjan")
      sendMessage(result.message, result.createdAt);
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
  });

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

const Emoji = {
  ":yum:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/face-savoring-food_1f60b.png",
  ":innocent:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/smiling-face-with-halo_1f607.png",
  ":sweat_smile:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/grinning-face-with-sweat_1f605.png",
  ":smiling_face_with_3_hearts:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/smiling-face-with-hearts_1f970.png",
  ":heart_eyes:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/smiling-face-with-heart-eyes_1f60d.png",
  ":kissing_heart:":
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/144/google/298/face-blowing-a-kiss_1f618.png",
};

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

app.post("/send", async (req, res) => {
  const body = req.body;
  const data = {
    info: "Fahim" + new Date().getTime(),
    message: "txt:" + body.text,
    name: "Fahim",
  };

  if (
    body.team_id == "T046NLMTSK0" &&
    body.channel_id == "C04H90EHP6C" &&
    body.user_id == "U046V6W7QNP"
  ) {
    const newMassage = new message(data);

    const result = await newMassage.save();

    let findUser = await user.find({ name: "Fahim" });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: "Fahim",
      });
    } else {
      const newUser = new user({ name: "Fahim" });
      const result = await newUser.save();
    }

    io.emit("newData", result);
    return { blocks: getBlocks("Fahim", result.message, result.createdAt) };
  } else {
    res.send("Does not allowed!");
  }
});

app.post("/emoji", async (req, res) => {
  const body = req.body;
  const data = {
    info: "Fahim" + new Date().getTime(),
    message: "img:" + Emoji[body.text],
    name: "Fahim",
  };

  if (
    body.team_id == "T046NLMTSK0" &&
    body.channel_id == "C04H90EHP6C" &&
    body.user_id == "U046V6W7QNP" &&
    Emoji[body.text]
  ) {
    const newMassage = new message(data);

    const result = await newMassage.save();

    let findUser = await user.find({ name: "Fahim" });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: "Fahim",
      });
    } else {
      const newUser = new user({ name: "Fahim" });
      const result = await newUser.save();
    }

    io.emit("newData", result);
    return { blocks: getBlocks("Fahim", result.message, result.createdAt) };
  } else {
    res.send("Does not allowed!");
  }
});

app.post("/active", async (req, res) => {
  const body = req.body;
  if (
    body.team_id == "T046NLMTSK0" &&
    body.channel_id == "C04H90EHP6C" &&
    body.user_id == "U046V6W7QNP"
  ) {
    let findUser = await user.find({ name: socket.handshake.auth.name });
    if (findUser.length) {
      await user.findByIdAndUpdate(findUser[0]._id, {
        name: "Fahim",
      });
    } else {
      const newUser = new user({ name: "Fahim" });
      const result = await newUser.save();
    }

    let activeUser = await user.find({
      name: User["Fahim"],
    });
    return activeUser.length ? activeUser[0].updatedAt : "";
  } else {
    res.send("Does not allowed!");
  }
});

server.listen(9443, () => {
  console.log(`app listening to port ${9443}`);
});

// http server
const httpServer = http.createServer(app);

httpServer.listen(9080);
