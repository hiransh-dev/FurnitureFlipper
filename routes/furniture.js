const path = require("path");
const express = require("express");
const router = express.Router();

const Furniture = require(path.join(__dirname, "../models/dbFurniture"));
const { joiFurnitureSchema } = require(path.join(__dirname, "../joi_schema"));

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const { checkLogin, isAuthor } = require("../middleware");

const validateFurnitureSchema = (req, res, next) => {
  const { error } = joiFurnitureSchema.validate(req.body);
  if (error) {
    const err_msg = error.details.map((er) => er.message).join(",");
    throw new expressError(err_msg, 400); /* 400 stand for bad request */
  } else {
    next();
  }
};

/* INDEX ROUTE (INDEX shows all listings) */
router.get(
  "/",
  catchAsync(async (req, res) => {
    const all_furniture = await Furniture.find().sort({ _id: -1 });
    res.render("furniture/index", { all_furniture, title: "All Listings" });
  })
);

/* CREATE ROUTE */
router.get("/new", checkLogin, (req, res) => {
  res.render("furniture/new", { title: "New" });
});

router.post(
  "/new",
  checkLogin,
  validateFurnitureSchema,
  catchAsync(async (req, res) => {
    const new_furniture = new Furniture(req.body.furniture);
    new_furniture.timestamp = timestampToday;
    new_furniture.author = req.user._id;
    await new_furniture.save();
    res.redirect("/furniture/" + new_furniture._id);
  })
);

/* READ / show ROUTE */
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id)
      .populate("author")
      .populate({
        path: "questions",
        populate: {
          path: "author",
        },
        options: { sort: { _id: -1 } },
      }); /*can pupulate directly but needed options, sort here*/
    res.render("furniture/show", { selectedFurniture, title: "View" });
  })
);

/* UPDATE ROUTE */
router.get(
  "/:id/edit",
  checkLogin,
  isAuthor,
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id);
    res.render("furniture/edit", { selectedFurniture, title: "Edit" });
  })
);

router.put(
  "/:id",
  checkLogin,
  isAuthor,
  validateFurnitureSchema,
  catchAsync(async (req, res, next) => {
    const edited_furniture = req.body.furniture;
    await Furniture.findByIdAndUpdate(req.params.id, {
      title: edited_furniture.title,
      price: edited_furniture.price,
      imageurl: edited_furniture.imageurl,
      desc: edited_furniture.desc,
    });
    res.redirect(`/furniture/${req.params.id}`);
  })
);

/* DELETE ROUTE */
router.delete(
  "/:id",
  checkLogin,
  isAuthor,
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndDelete(req.params.id);
    res.redirect("/furniture");
  })
);

module.exports = router;
