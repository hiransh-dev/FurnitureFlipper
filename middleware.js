const path = require("path");
const Furniture = require(path.join(__dirname, "/models/dbFurniture"));
const Questions = require(path.join(__dirname, "/models/dbQuestions"));

const checkLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // ENTER FLASH LATER
    // req.session.returnURL = req.originalUrl; COMMENTED CAUSE IT BREAKS AT UPDATE/DELETE URLs
    return res.redirect("/login");
  }
  next();
};

//just checkLogin in rev for Middleware, if user tries to login/register after being actually loggedin
const LoggedinTrue = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

const isAuthor = async (req, res, next) => {
  const foundFurniture = await Furniture.findById(req.params.id);
  if (!foundFurniture.author.equals(req.user._id)) {
    // add flash message later
    return res.redirect("/furniture/" + req.params.id);
  }
  next();
};

const isQuestionAuthor = async (req, res, next) => {
  const foundQuestion = await Questions.findById(req.params.quesid);
  if (foundQuestion && !foundQuestion.author.equals(req.user._id)) {
    // add flash message later
    return res.redirect("/furniture/" + req.params.id);
  }
  next();
};

module.exports = { checkLogin, LoggedinTrue, isAuthor, isQuestionAuthor };
