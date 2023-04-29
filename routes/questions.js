const path = require("path");
const express = require("express");
const router = express.Router({ mergeParams: true }); //to get :id from furnitureRoute

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const Furniture = require(path.join(__dirname, "../models/dbFurniture"));
const Questions = require(path.join(__dirname, "../models/dbQuestions"));

const { joiQuestionsSchema } = require(path.join(__dirname, "../joi_schema"));

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
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id);
    const new_question = new Questions(req.body.questions);
    new_question.timestamp = timestampToday;
    selectedFurniture.questions.push(new_question);
    await new_question.save();
    await selectedFurniture.save();
    res.redirect(`/furniture/${selectedFurniture._id}`);
  })
);

router.delete(
  "/:quesid",
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndUpdate(req.params.id, {
      $pull: { questions: req.params.quesid },
    });
    await Questions.findByIdAndDelete(req.param.quesid);
    res.redirect("/furniture/" + req.params.id);
  })
);

module.exports = router;
