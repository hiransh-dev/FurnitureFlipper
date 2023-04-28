const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const path = require("path");
const Questions = require(path.join(__dirname, "/dbQuestions"));

const FurnitureSchema = new Schema({
  title: String,
  price: Number,
  desc: String,
  location: String,
  imageurl: String,
  //images array
  timestamp: String,
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Questions",
    },
  ],
  //category enum
});

/* MIDDLEWARE to Delete Questions asked in a Furniture Listing */
FurnitureSchema.post("findOneAndDelete", async function (deletedFurniture) {
  if (deletedFurniture) {
    await Questions.deleteMany({
      _id: { $in: deletedFurniture.questions },
    });
  }
});

module.exports = mongoose.model("Furniture", FurnitureSchema);
