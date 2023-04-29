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

module.exports = { checkLogin, LoggedinTrue };
