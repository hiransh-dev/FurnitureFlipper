const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionsSchema = new Schema({
  ques: String,
  ans: String,
  timestamp: String,
});

module.exports = mongoose.model("Questions", QuestionsSchema);
