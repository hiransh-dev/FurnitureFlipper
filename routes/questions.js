const path = require("path");
const express = require("express");
const router = express.Router({ mergeParams: true }); //to get :id from furnitureRoute

const Furniture = require(path.join(__dirname, "../models/dbFurniture"));
const Questions = require(path.join(__dirname, "../models/dbQuestions"));
const { joiQuestionsSchema } = require(path.join(__dirname, "../joi_schema"));

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const { checkLogin, isAuthor, isQuestionAuthor } = require("../middleware");

const validateQuestionsSchema = (req, res, next) => {
  const { error } = joiQuestionsSchema.validate(req.body);
  if (error) {
    const err_msg = error.details.map((er) => er.message).join(",");
    throw new expressError(err_msg, 400); /* 400 stand for bad request */
  } else {
    next();
  }
};

/* QUESTIONS ROUTES (CREATE & DELETE) */
router.post(
  "/",
  validateQuestionsSchema,
  checkLogin,
  catchAsync(async (req, res) => {
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
  })
);

router.delete(
  "/:quesid",
  checkLogin,
  isQuestionAuthor,
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndUpdate(req.params.id, {
      $pull: { questions: req.params.quesid },
    });
    await Questions.findByIdAndDelete(req.params.quesid);
    res.redirect("/furniture/" + req.params.id);
  })
);

/* ANSWER ROUTES */
router.put(
  "/:quesid/answer",
  // validateQuestionsSchema,
  checkLogin,
  isAuthor /*Only Post Author can reply for an answer*/,
  catchAsync(async (req, res) => {
    const checkForAnswer = Questions.findById(req.params.quesid);
    if (checkForAnswer && checkForAnswer.ans) {
      return res.redirect(`/furniture/${req.params.id}`);
    }
    const { ans } = req.body.questions;
    await Questions.findByIdAndUpdate(req.params.quesid, {
      ans: ans,
    });
    res.redirect(`/furniture/${req.params.id}`);
  })
);

// LATER DELETE ANSWER ROUTE

// router.delete(
//   "/:quesid/answer",
//   checkLogin,
//   isAuthor,
//   catchAsync(async (req, res) => {
//     await Furniture.findByIdAndUpdate(req.params.quesid, {
//       $pull: { questions: req.params.quesid },
//     });
//     res.redirect("/furniture/" + req.params.id);
//   })
// );

module.exports = router;
