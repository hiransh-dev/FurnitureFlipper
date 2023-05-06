const path = require("path");
const expressError = require(path.join(__dirname, "/utils/ExpressError"));
const Furniture = require(path.join(__dirname, "/models/dbFurniture"));
const Questions = require(path.join(__dirname, "/models/dbQuestions"));

//TO DELETE FROM CLOUDINARY
// const { cloudinary } = require("../cloudinary");
//TO DELETE FROM LOCAL STORAGE (UPLOADED MY MULTER)
const fs = require("fs");

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

const unexpFileDel = async (files) => {
  // Deletes on Cloudinary Storage
  // for (let file of files) {
  //   await cloudinary.uploader.destroy(file.filename);
  // }
  // Deletes on Local Storage, Remove when switching to cloudinary storage
  for (let file of files) {
    fs.unlink(path.join(__dirname, file.path), (err) => {
      if (err) {
        throw new expressError("Internal Error", 500);
      }
      // console.log("deleted" + path.join(__dirname, "../", file.path));
    });
  }
};

module.exports = {
  checkLogin,
  LoggedinTrue,
  isAuthor,
  isQuestionAuthor,
  unexpFileDel,
};
