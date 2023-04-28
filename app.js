const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const mongoose = require("mongoose");
const dbcon = require(path.join(__dirname, "/dbcon"));
const Furniture = require(path.join(__dirname, "/models/dbFurniture"));
const Questions = require(path.join(__dirname, "/models/dbQuestions"));

const { joiFurnitureSchema, joiQuestionsSchema } = require(path.join(
  __dirname,
  "/joi_schema"
));

const catchAsync = require(path.join(__dirname, "/utils/catchAsync"));
const expressError = require(path.join(__dirname, "/utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "/utils/timeFunc"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //to read req.body.example in app.post for POST methods
app.use(methodOverride("_method"));

app.use(express.static("public"));

const validateFurnitureSchema = (req, res, next) => {
  const { error } = joiFurnitureSchema.validate(req.body);
  if (error) {
    const err_msg = error.details.map((er) => er.message).join(",");
    throw new expressError(err_msg, 400); /* 400 stand for bad request */
  } else {
    next();
  }
};

const validateQuestionsSchema = (req, res, next) => {
  const { error } = joiQuestionsSchema.validate(req.body);
  if (error) {
    const err_msg = error.details.map((er) => er.message).join(",");
    throw new expressError(err_msg, 400); /* 400 stand for bad request */
  } else {
    next();
  }
};

/* HOME and INDEX ROUTE (INDEX shows all listings) */
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get(
  "/furniture",
  catchAsync(async (req, res) => {
    const all_furniture = await Furniture.find().sort({ _id: -1 });
    res.render("furniture/index", { all_furniture, title: "All Listings" });
  })
);

/* CREATE ROUTE */
app.get(
  "/furniture/new",
  catchAsync(async (req, res) => {
    res.render("furniture/new", { title: "New" });
  })
);

app.post(
  "/furniture/new",
  validateFurnitureSchema,
  catchAsync(async (req, res) => {
    const new_furniture = new Furniture(req.body.furniture);
    new_furniture.timestamp = timestampToday;
    await new_furniture.save();
    res.redirect("/furniture/" + new_furniture._id);
  })
);

/* READ / show ROUTE */
app.get(
  "/furniture/:id",
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id).populate({
      path: "questions",
      options: { sort: { _id: -1 } },
    }); /*can pupulate directly but needed options, sort here*/
    res.render("furniture/show", { selectedFurniture, title: "View" });
  })
);

/* UPDATE ROUTE */
app.get(
  "/furniture/:id/edit",
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id);
    res.render("furniture/edit", { selectedFurniture, title: "Edit" });
  })
);

app.put(
  "/furniture/:id",
  validateFurnitureSchema,
  catchAsync(async (req, res, next) => {
    const edit_furniture = req.body.furniture;
    await Furniture.findByIdAndUpdate(req.params.id, {
      title: edit_furniture.title,
      price: edit_furniture.price,
      imageurl: edit_furniture.imageurl,
      desc: edit_furniture.description,
    });
    res.redirect(`/furniture/${req.params.id}`);
  })
);

/* DELETE ROUTE */
app.delete(
  "/furniture/:id",
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndDelete(req.params.id);
    res.redirect("/furniture");
  })
);

/* QUESTIONS ROUTES (CREATE & DELETE) */
app.post(
  "/furniture/:id/questions",
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

app.delete(
  "/furniture/:id/questions/:quesid",
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndUpdate(req.params.id, {
      $pull: { questions: req.params.quesid },
    });
    await Questions.findByIdAndDelete(req.param.quesid);
    res.redirect("/furniture/" + req.params.id);
  })
);

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
