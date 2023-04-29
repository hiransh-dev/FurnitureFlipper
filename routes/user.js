const path = require("path");
const express = require("express");
const passport = require("passport");
const router = express.Router();

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const { checkLogin, LoggedinTrue } = require("../middleware");

const User = require(path.join(__dirname, "../models/dbUser"));
const { joiUserSchema } = require(path.join(__dirname, "../joi_schema"));

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
router.get("/register", LoggedinTrue, (req, res) => {
  res.render("users/register", { title: "Register" });
});

router.post(
  "/register",
  LoggedinTrue,
  validateUserSchema,
  catchAsync(async (req, res) => {
    const { email, firstName, lastName, pwd } = req.body.userRegister;
    const new_user = new User({ email, firstName, lastName });
    new_user.username = email;
    new_user.timestamp = timestampToday;
    const createdUser = await User.register(new_user, pwd);
    // console.log(createdUser);
    res.redirect("/login");
  })
);

// LOGIN ROUTES
router.get("/login", LoggedinTrue, (req, res) => {
  res.render("users/login", { title: "Login" });
});

router.post(
  "/login",
  LoggedinTrue,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // if (res.locals.returnURL) {
    //   return res.redirect(res.locals.returnURL);
    // } COMMENTED CAUSE IT BREAKS AT UPDATE/DELETE URLs
    res.redirect("/furniture");
  }
);

// LOGOUT ROUTES
router.get("/logout", checkLogin, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // req.flash("success", "Goodbye!");
    res.redirect("/");
  });
});

module.exports = router;
