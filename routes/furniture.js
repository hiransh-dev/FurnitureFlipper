const path = require("path");
const express = require("express");
const router = express.Router();

const furnitureController = require("../controllers/furniture");
const Furniture = require(path.join(__dirname, "../models/dbFurniture"));
const { joiFurnitureSchema } = require(path.join(__dirname, "../joi_schema"));

const multer = require("multer");

// ENABLE THIS FOR LOCAL STORAGE
const upload = multer({ dest: "public/temp/uploads/" });

// ENABLE THIS FOR CLOUDINARY STORAGE, WHEN DEPLOYED.
// const { storage } = require("../cloudinary");
// const upload = multer({ storage });
//

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
router.get("/", catchAsync(furnitureController.index));

router.get("/furnituremaps", catchAsync(furnitureController.allmaps));

router.get("/map", furnitureController.mapview);

/* CREATE ROUTE */
router
  .route("/new")
  .get(checkLogin, furnitureController.renderNew)
  .post(
    checkLogin,
    upload.array("furniture[imageurl]", 4),
    validateFurnitureSchema,
    catchAsync(furnitureController.new)
  );

router
  .route("/:id")
  /* READ / show ROUTE */
  .get(catchAsync(furnitureController.read))
  /* DELETE ROUTE */
  .delete(checkLogin, isAuthor, catchAsync(furnitureController.delete));

/* UPDATE ROUTE */
router
  .route("/:id/edit")
  .get(checkLogin, isAuthor, catchAsync(furnitureController.renderEdit))
  .put(
    checkLogin,
    isAuthor,
    upload.array("furniture[imageurl]"),
    validateFurnitureSchema,
    catchAsync(furnitureController.update)
  );

module.exports = router;
