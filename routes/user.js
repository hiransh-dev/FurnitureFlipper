const path = require("path");
const express = require("express");
const router = express.Router();

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const User = require(path.join(__dirname, "../models/dbUser"));

router.get("/register", (req, res) => {
  res.render("users/register", { title: "Register" });
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    const { email, firstName, lastName, pwd } = req.body.userRegister;
    const new_user = new User({ email, firstName, lastName });
    new_user.username = email;
    const createdUser = await User.register(new_user, pwd);
    console.log(createdUser);
    res.redirect("/furniture");
  })
);

module.exports = router;
