const mongoose = require("mongoose");

// Atlas URL
const my_db = process.env.MONGO_URL;
const connect = () => {
  mongoose.connect(my_db).then(() => {
    console.log('Connected to MongoDB');
  })
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("DB connected....");
  });
};
module.exports = connect;
