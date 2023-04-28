const mongoose = require("mongoose");

db_function().catch((err) => console.log(err));

async function db_function() {
  await mongoose.connect("mongodb://127.0.0.1:27017/furnitureFlipper_db");
  console.log("Database Connected");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
