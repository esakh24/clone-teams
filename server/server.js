const express = require("express");
//cors provides Express middleware to enable CORS
const cors = require("cors");
//start sever with app
const app = express();
const Peer = require("peer");
const path = require("path");
const server = require("http").Server(app);
const config = require("./config/db.config.js");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const mongoose = require("mongoose");
var corsOptions = {
  origin: "*",
  methods: "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
  allowedHeaders:
    "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
const uri = "<inset your db link here>";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

require("./models/message.model");

require("./models/user.model");
require("./models/team.model");

const Message = mongoose.model("Message");
const User = mongoose.model("User");
const Team = mongoose.model("Team");

// support parsing of application/json type post data
app.use(express.json());

// support parsing of application/x-www-form-urlencoded type post data
app.use(express.urlencoded({ extended: true }));
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
    allowedHeaders:
      "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
  },
});
const { ExpressPeerServer } = require("peer");
const { Console } = require("console");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);

let socketList = {};
const channels = {};

exports.findNoOfParticipants = (roomId) => {
  console.log(roomId);
  console.log(io.sockets.adapter.rooms);
  const clients = io.sockets.adapter.rooms.get(roomId);
  if (!clients) {
    return 0;
  } else {
    return clients.size;
  }
};
const savemsg = async (userId, id, message, userName) => {
  console.log("requeted to save" + message + id + userId);
  const newMessage = new Message({
    msg: message,
    userId: userId,
    teamId: id,
    username: userName,
  });
  await newMessage.save();
};

//server listening for join-room event
io.on("connection", (socket) => {
  console.log("Made socket connection");
  console.log("socket " + socket.id);
  socket.on("join-chat-room", ({ id, userId }) => {
    socket.userId = userId;
    socket.join(id);
  });
  socket.on("sendMessage", ({ userId, id, message, userName }) => {
    io.sockets.in(id).emit("receiveMessage", {
      msg: message,
      userId: userId,
      teamId: id,
      username: userName,
    });
    console.log("requeted to save" + message + id + userId);
    console.log("creating msg");
    savemsg(userId, id, message, userName);

    console.log("created msg");
  });
  //the underlying Adapter will emit the following events
  socket.on("preview-complete", () => {
    console.log("tellliing to set userstream" + socket.id);
    io.to(socket.id).emit("set-your-stream");
    socket.on(
      "join-meeting-room",
      ({ chatroomId, roomId, name, isVideo, isAudio }) => {
        // Socket Join RoomName
        console.log("emmited join");
        socket.join(chatroomId);
        socket.join(roomId);
        console.log(
          " socket " + socket.id + " joined  " + roomId + "with name " + name
        );
        //pass value as weell
        socketList[socket.id] = {
          name: name,
          room: roomId,
          isVideo: isVideo,
          isAudio: isAudio,
        };
        console.log(io.sockets.adapter.rooms.get(roomId).size);
        var clients = io.sockets.adapter.rooms.get(roomId);

        const peersInRoom = [];
        clients.forEach((client) => {
          peersInRoom.push({ userId: client, details: socketList[client] });
        });
        socket.broadcast.to(roomId).emit("peer-wants-to-join", {
          userId: socket.id,
          details: socketList[socket.id],
        });
      }
    );
  });

  socket.on("sending-offer", ({ to, from, offerData }) => {
    io.to(to).emit("receive-offer", {
      offerData,
      details: socketList[socket.id],
      from,
    });
  });
  socket.on("sending-answer", ({ to, from, answerData }) => {
    io.to(to).emit("receive-answer", {
      answerData,
      details: socketList[socket.id],
      from,
    });
  });

  socket.on("toggle-media", ({ target, roomId }) => {
    if (target == "audio") {
      socketList[socket.id].isAudio = !socketList[socket.id].isAudio;
    } else {
      socketList[socket.id].isVideo = !socketList[socket.id].isVideo;
    }
    io.sockets
      .in(roomId)
      .emit("update-toggled-media", { target: target, peerID: socket.id });
  });
  socket.on("start-screen-sharing", ({ roomId }) => {
    socket.broadcast.to(roomId).emit("started-screen-sharing", {
      userId: socket.id,
    });
  });
  socket.on("stop-screen-sharing", ({ roomId }) => {
    socket.broadcast.to(roomId).emit("stopped-screen-sharing", {
      userId: socket.id,
    });
  });
  socket.on("leave-room", ({ roomId, leaver }) => {
    try {
      const { room } = socketList[socket.id];
      console.log("emmiting " + socket.id + "user" + room);
      socket.broadcast
        .to(room)
        .emit("user-leaving", { userId: socket.id, name: [socket.id] });
      socket.leave(roomId);
      delete socketList[socket.id];
    } catch (e) {
      console.log(e);
    }
    console.log(" disconnected!");
  });
  socket.on("disconnect", () => {
    console.log(socketList);
    try {
      const { room } = socketList[socket.id];
      console.log("emmiting " + socket.id + "user" + room);
      socket.broadcast
        .to(room)
        .emit("user-leaving", { userId: socket.id, name: [socket.id] });
      delete socketList[socket.id];
    } catch (e) {}
    socket.leave(roomId);
    socket.disconnect();
    console.log("User disconnected!");
  });
});

const PORT = process.env.PORT || 8085;
server
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on("error", (e) => {
    console.error(e);
  });
