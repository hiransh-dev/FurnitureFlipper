if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");

const mongoose = require("mongoose");
const dbcon = require(path.join(__dirname, "/dbcon"));

const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");

/*NEED USER MODEL FOR PASSPORT AUTHENTICATION*/
const User = require(path.join(__dirname, "/models/dbUser"));

const furnitureRoutes = require(path.join(__dirname, "/routes/furniture"));
const questionsRoutes = require(path.join(__dirname, "/routes/questions"));
const userRoutes = require(path.join(__dirname, "/routes/user"));

const expressError = require(path.join(__dirname, "/utils/ExpressError"));

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// TO SANITIZE MONGO QUERIES IN URL
app.use(mongoSanitize());
// FOR CONTENT SECURITY POLICY & MORE SECURITY HEADERS
app.use(helmet());
const scriptSrcUrls = [
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://tile.openstreetmap.org",
  "https://*.tile.openstreetmap.org",
];
const styleSrcUrls = [
  "https://fonts.googleapis.com/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://fonts.gstatic.com",
  "https://tile.openstreetmap.org",
  "https://*.tile.openstreetmap.org",
];
const connectSrcUrls = [
  "https://api.openstreetmap.org/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://fonts.googleapis.com/",
  "https://fonts.gstatic.com",
  "https://tile.openstreetmap.org",
  "https://*.tile.openstreetmap.org",
];
const fontSrcUrls = [
  "https://fonts.googleapis.com/",
  "https://fonts.gstatic.com",
  "https://unpkg.com",
  "https://tile.openstreetmap.org",
  "https://*.tile.openstreetmap.org",
];
app.use(
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  helmet.crossOriginEmbedderPolicy({ policy: "credentialless" })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "'unsafe-inline'", ...connectSrcUrls],
      scriptSrc: [
        "'unsafe-inline'",
        "'self'",
        "'unsafe-eval'",
        ...scriptSrcUrls,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "'unsafe-inline'",
        "https://res.cloudinary.com/dfkwwqgdx/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://tile.openstreetmap.org",
        "https://*.tile.openstreetmap.org",
        "https://unpkg.com",
        "openstreetmap.org",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(express.urlencoded({ extended: true })); //to read req.body.example in app.post for POST methods
app.use(methodOverride("_method"));

app.use(express.static("public"));
app.use(flash());

const sessionConfig = {
  name: "session" /* NOT REQUIRED, JUST TO CHANGE SESSION NAME */,
  secret: "tempSecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // + (milliseconds*seconds*minutes*hours*days) 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  // store:
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // if (req.session.returnURL) {
  //   res.locals.returnURL = req.session.returnURL;
  // } COMMENTED CAUSE IT BREAKS AT UPDATE/DELETE URLs
  res.locals.currentUser = req.user;
  next();
});

app.use("/", userRoutes);
app.use("/furniture", furnitureRoutes);
app.use("/furniture/:id/questions", questionsRoutes);

/* HOME ROUTE */
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.all("*", (req, res, next) => {
  next(new expressError("Page doesn't exist", 404));
});

app.use((err, req, res, next) => {
  const { message = "Unknown Error", statusCode = 500 } = err;
  //console.log(err);
  res.status(statusCode).render("error", {
    message,
    // message: "Something Went Wrong! :(", //message changed for user/client
    statusCode,
    title: "Error",
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
