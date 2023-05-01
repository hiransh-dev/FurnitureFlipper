const path = require("path");
const Furniture = require(path.join(__dirname, "../models/dbFurniture"));
const Questions = require(path.join(__dirname, "../models/dbQuestions"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

module.exports.new = async (req, res) => {
  const selectedFurniture = await Furniture.findById(req.params.id);
  if (selectedFurniture.author._id.equals(req.user._id)) {
    return res.redirect(`/furniture/${req.params.id}`);
  } /* Checks from backend to see if the current user is not posting the question */
  const { ques } = req.body.questions;
  const new_question = new Questions();
  new_question.ques = ques;
  new_question.timestamp = timestampToday;
  new_question.author = req.user._id;
  selectedFurniture.questions.push(new_question);
  await new_question.save();
  await selectedFurniture.save();
  res.redirect(`/furniture/${selectedFurniture._id}`);
};

module.exports.delete = async (req, res) => {
  await Furniture.findByIdAndUpdate(req.params.id, {
    $pull: { questions: req.params.quesid },
  });
  await Questions.findByIdAndDelete(req.params.quesid);
  res.redirect("/furniture/" + req.params.id);
};

module.exports.newAnswer = async (req, res) => {
  const checkForAnswer = Questions.findById(req.params.quesid);
  if (checkForAnswer && checkForAnswer.ans) {
    return res.redirect(`/furniture/${req.params.id}`);
  }
  const { ans } = req.body.questions;
  await Questions.findByIdAndUpdate(req.params.quesid, {
    ans: ans,
  });
  res.redirect(`/furniture/${req.params.id}`);
};
