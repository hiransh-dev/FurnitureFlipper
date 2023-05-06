const path = require("path");
const express = require("express");
const passport = require("passport");
const router = express.Router();

const userController = require("../controllers/user");
const { joiUserSchema } = require(path.join(__dirname, "../joi_schema"));

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));

const { checkLogin, LoggedinTrue } = require("../middleware");

const validateUserSchema = (req, res, next) => {
  const { error } = joiUserSchema.validate(req.body);
  if (error) {
    const err_msg = error.details.map((er) => er.message).join(",");
    throw new expressError(err_msg, 400); /* 400 stand for bad request */
  } else {
    next();
  }
};

// REGISTER ROUTES
router
  .route("/register")
  .get(LoggedinTrue, userController.renderRegister)
  .post(LoggedinTrue, validateUserSchema, catchAsync(userController.register));

// LOGIN ROUTES
router
  .route("/login")
  .get(LoggedinTrue, userController.renderLogin)
  .post(
    LoggedinTrue,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login
  );

// LOGOUT ROUTES
router.get("/logout", checkLogin, userController.logout);

module.exports = router;
