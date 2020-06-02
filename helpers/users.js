const db = require("../config/db");
const users = [];

// let Query = `SELET * FROM activerooms`;
// db.query(Query, (err, res) => {
// console.log('====================================');
// console.log(res);
// console.log('====================================');
// users.push(res[0]);
// });

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  let insertQuery = `INSERT INTO activerooms SET ?`;

  if (!name || !room) {
    return { error: "Username and room required" };
  }

  const user = { id, name, room };
  db.query(insertQuery, user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
