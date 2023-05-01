const path = require("path");
const User = require(path.join(__dirname, "../models/dbUser"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

module.exports.renderRegister = (req, res) => {
  res.render("users/register", { title: "Register" });
};

module.exports.register = async (req, res) => {
  const { email, firstName, lastName, pwd } = req.body.userRegister;
  const new_user = new User({ email, firstName, lastName });
  new_user.username = email;
  new_user.timestamp = timestampToday;
  // const createdUser = await User.register(new_user, pwd);
  // console.log(createdUser);
  await User.register(new_user, pwd);
  res.redirect("/login");
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login", { title: "Login" });
};

module.exports.login = (req, res) => {
  // if (res.locals.returnURL) {
  //   return res.redirect(res.locals.returnURL);
  // } COMMENTED CAUSE IT BREAKS AT UPDATE/DELETE URLs
  res.redirect("/furniture");
};

module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // req.flash("success", "Goodbye!");
    res.redirect("/");
  });
};
