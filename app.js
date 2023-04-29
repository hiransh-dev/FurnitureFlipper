const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const mongoose = require("mongoose");
const dbcon = require(path.join(__dirname, "/dbcon"));
const User = require(path.join(__dirname, "/models/dbUser"));

const furnitureRoutes = require(path.join(__dirname, "/routes/furniture"));
const questionsRoutes = require(path.join(__dirname, "/routes/questions"));

const expressError = require(path.join(__dirname, "/utils/ExpressError"));
const catchAsync = require(path.join(__dirname, "/utils/catchAsync"));
const timestampToday = require(path.join(__dirname, "/utils/timeFunc"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //to read req.body.example in app.post for POST methods
app.use(methodOverride("_method"));

app.use(express.static("public"));

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
