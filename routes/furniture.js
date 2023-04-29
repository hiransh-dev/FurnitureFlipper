const path = require("path");
const express = require("express");
const router = express.Router();

const catchAsync = require(path.join(__dirname, "../utils/catchAsync"));
const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

const Furniture = require(path.join(__dirname, "../models/dbFurniture"));

const { joiFurnitureSchema } = require(path.join(__dirname, "../joi_schema"));

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
router.get(
  "/new",
  catchAsync(async (req, res) => {
    res.render("furniture/new", { title: "New" });
  })
);

router.post(
  "/new",
  validateFurnitureSchema,
  catchAsync(async (req, res) => {
    const new_furniture = new Furniture(req.body.furniture);
    new_furniture.timestamp = timestampToday;
    await new_furniture.save();
    res.redirect("/furniture/" + new_furniture._id);
  })
);

/* READ / show ROUTE */
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id).populate({
      path: "questions",
      options: { sort: { _id: -1 } },
    }); /*can pupulate directly but needed options, sort here*/
    res.render("furniture/show", { selectedFurniture, title: "View" });
  })
);

/* UPDATE ROUTE */
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const selectedFurniture = await Furniture.findById(req.params.id);
    res.render("furniture/edit", { selectedFurniture, title: "Edit" });
  })
);

router.put(
  "/:id",
  validateFurnitureSchema,
  catchAsync(async (req, res, next) => {
    const edit_furniture = req.body.furniture;
    await Furniture.findByIdAndUpdate(req.params.id, {
      title: edit_furniture.title,
      price: edit_furniture.price,
      imageurl: edit_furniture.imageurl,
      desc: edit_furniture.desc,
    });
    res.redirect(`/furniture/${req.params.id}`);
  })
);

/* DELETE ROUTE */
router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    await Furniture.findByIdAndDelete(req.params.id);
    res.redirect("/furniture");
  })
);

module.exports = router;
