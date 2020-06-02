const uuid = require("uuid");
const auth = require("./auth");

const { addUser, removeUser, getUsersInRoom } = require("../helpers/users");
module.exports = (app, io, db) => {
  io.on("connection", function (socket) {
    // "6YDAM1LVauUWTnQoAAAC",
    socket.on("join", ({ name, room }, callback) => {
      const { error, user } = addUser({
        id: socket.id,
        name,
        room,
      });

      if (error) return callback(error);

      socket.join(user.room);

      socket.emit("message", [
        {
          id: uuid.v4(),
          name: "@vendorBot",
          msg: `${user.name}, welcome to boltskills ${user.room} room.`,
          msgid: uuid.v4(),
          date: "your own date",
          type: "bot",
          chatUser: user.name,
        },
      ]);

      socket.broadcast.to(user.room).emit("message", [
        {
          id: uuid.v4(),
          name: "@vendorBot",
          msg: `${user.name}, has joined bolt skills vendor app.`,
          msgid: uuid.v4(),
          date: "your own date",
          type: "bot",
          chatUser: user.name,
        },
      ]);
      callback();
    });

    socket.on("getMessages", () => {
      app.get('/messages', (req, res) => {
        let getQuery = `SELECT * FROM chatroom ORDER BY id DECS`;

        db.query(getQuery, (err, result) => {
          return res.status(200).json({
            message: result
          });
        });
      });
    });

    socket.on("sendMessage",
      ({ name, msg, date, room }),
      callback => {
        io.to(room).emit(
          "message",
          [
            {
              id: uuid.v4(),
              name,
              msg,
              date: "your own date",
              type: "",
              chatUser: name,
              from: name
            },
          ],
          callback()
        );
        callback();
      });

    socket.on("disconnect", () => {
      let getDeleteSQL = `DELETE FROM activerooms WHERE id = ?`;

      db.query(getDeleteSQL, socket.id, (err, user) => {
        if (user) {
          io.to(user.room).emit("message", {
            id: uuid.v4(),
            name: "@vendorBot",
            msg: `${user.name}, has joined bolt skills vendor app.`,
            date: "your own date",
            msgid: uuid.v4(),
            chatUser: user.name,
          });
          io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
          });
        }
      });
    });

    //  Chatroom api
    app.post("/chatroom", (req, res) => {
      const data = req.body;
      const { name, msg, date, type, chatUser } = data[0];

      if (!msg) return res.status(200).json({ msg: "please type a msg" });

      let sqlQuery = `INSERT INTO chatroom SET ?`;

      const msgbody = {
        id: uuid.v4(),
        msgid: uuid.v4(),
        name, msg, date, chatUser, type
      };

      db.query(sqlQuery, msgbody);
    });

  });
};