const path = require("path");
const express = require("express");
const router = express.Router({ mergeParams: true }); //to get :id from furnitureRoute

const questionsController = require("../controllers/questions");
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
  catchAsync(questionsController.new)
);

router.delete(
  "/:quesid",
  checkLogin,
  isQuestionAuthor,
  catchAsync(questionsController.delete)
);

/* ANSWER ROUTES */
router.put(
  "/:quesid/answer",
  // validateQuestionsSchema,
  checkLogin,
  isAuthor /*Only Post Author can reply for an answer*/,
  catchAsync(questionsController.newAnswer)
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
