const path = require("path");
const Furniture = require(path.join(__dirname, "../models/dbFurniture"));

const expressError = require(path.join(__dirname, "../utils/ExpressError"));
const timestampToday = require(path.join(__dirname, "../utils/timeFunc"));

//TO DELETE FROM CLOUDINARY
const { cloudinary } = require("../cloudinary");
//TO DELETE FROM LOCAL STORAGE (UPLOADED MY MULTER)
const fs = require("fs");

const { unexpFileDel } = require("../middleware");

module.exports.index = async (req, res) => {
  const curPageNum = req.query.page ? req.query.page : 1;
  const options = {
    page: curPageNum,
    limit: 8,
    collation: {
      locale: "en",
    },
    sort: { _id: -1 },
  };
  await Furniture.paginate({}, options, function (err, result) {
    return res.render("furniture/", {
      result,
      title: "All Listings",
    });
  });
  // FOR ENTIRE LISTING ON SINGLE PAGE RENDER (NO PAGINATE)
  // const all_furniture = await Furniture.find().sort({ _id: -1 });
  // res.render("furniture/", { all_furniture, title: "All Listings" });
};

module.exports.allmaps = async (req, res) => {
  // API to respond with all lat & lng for MapMarker
  const all_furniture = await Furniture.find({}, "title lat lng");
  res.json(all_furniture);
};

module.exports.mapview = async (req, res) => {
  res.render("furniture/map", { title: "Map Listed" });
};

module.exports.searchFurniture = async (req, res) => {
  const curPageNum = req.query.page ? req.query.page : 1;
  const searchString = req.query.q;
  const searchRegex = new RegExp(searchString, "i");
  const options = {
    page: curPageNum,
    limit: 8,
    collation: {
      locale: "en",
    },
    sort: { _id: -1 },
  };
  await Furniture.paginate(
    { title: searchRegex },
    options,
    function (err, result) {
      res.render("furniture/search", {
        result,
        searchString,
        title: "Search",
      });
    }
  );
};

module.exports.userFurnitureList = async (req, res) => {
  const curPageNum = req.query.page ? req.query.page : 1;
  const options = {
    page: curPageNum,
    limit: 8,
    collation: {
      locale: "en",
    },
    sort: { _id: -1 },
  };
  await Furniture.paginate(
    { author: req.user._id },
    options,
    function (err, result) {
      // console.log(result.docs);
      return res.render("furniture/mylist", { result, title: "My List" });
    }
  );
};

module.exports.renderNew = (req, res) => {
  res.render("furniture/new", { title: "New" });
};

module.exports.new = async (req, res, next) => {
  if (req.files.length === 0) {
    return next(new expressError("No file selected to upload", 500));
  }
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  for (let i = 0; i < req.files.length; i++) {
    if (!allowedTypes.includes(req.files[i].mimetype)) {
      unexpFileDel(req.files);
      return next(
        new expressError(
          "File selected isn't an image or a valid image type. Please select jpeg/jpg/png format",
          500
        )
      );
    }
  }
  const new_furniture = new Furniture(req.body.furniture);
  new_furniture.timestamp = timestampToday;
  new_furniture.author = req.user._id;
  new_furniture.imageurl = req.files.map((f) => ({
    // FOR LOCAL STORAGE URL, REMOVE/COMMENT WHEN DEPLOYED OR USING CLOUDINARY.
    url: "/temp/uploads/" + f.filename, //cant use f.path since it points to public & public is served as a static asset
    // ENABLE THIS FOR CLOUDINARY STORAGE, WHEN DEPLOYED.
    // url: f.path,

    filename: f.filename,
  }));
  await new_furniture.save();
  res.redirect("/furniture/" + new_furniture._id);
};

module.exports.read = async (req, res) => {
  const selectedFurniture = await Furniture.findById(req.params.id)
    .populate("author")
    .populate({
      path: "questions",
      populate: {
        path: "author",
      },
      options: { sort: { _id: -1 }, limit: 10 },
    }); /*can populate directly but needed options, sort here for latest questions*/
  res.render("furniture/show", { selectedFurniture, title: "View" });
};

module.exports.renderEdit = async (req, res) => {
  const selectedFurniture = await Furniture.findById(req.params.id);
  res.render("furniture/edit", { selectedFurniture, title: "Edit" });
};

module.exports.update = async (req, res, next) => {
  const foundFurniture = await Furniture.findById(req.params.id);
  const countTotalImages = foundFurniture.imageurl.length + req.files.length;
  if (countTotalImages >= 5) {
    unexpFileDel(req.files);
    return next(
      new expressError(
        "Can't upload more than 4 images. Please try again.",
        500
      )
    );
  }
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  for (let i = 0; i < req.files.length; i++) {
    if (!allowedTypes.includes(req.files[i].mimetype)) {
      unexpFileDel(req.files);
      return next(
        new expressError(
          "File selected isn't an image or a valid image type. Please select jpeg/jpg/png format",
          500
        )
      );
    }
  }
  const edited_furniture = req.body.furniture;
  const newEdit_furniture = await Furniture.findByIdAndUpdate(req.params.id, {
    title: edited_furniture.title,
    price: edited_furniture.price,
    // imageurl: edited_furniture.imageurl,
    desc: edited_furniture.desc,
  });
  const newimgs = req.files.map((f) => ({
    // FOR LOCAL STORAGE URL, REMOVE/COMMENT WHEN DEPLOYED OR USING CLOUDINARY.
    url: "/temp/uploads/" + f.filename,
    // ENABLE THIS FOR CLOUDINARY STORAGE, WHEN DEPLOYED.
    // url: f.path

    filename: f.filename,
  }));
  newEdit_furniture.imageurl.push(...newimgs);
  newEdit_furniture.save();
  //To delete images selected to be deleted
  if (req.body.deleteImgs) {
    await newEdit_furniture.updateOne({
      $pull: { imageurl: { filename: { $in: req.body.deleteImgs } } },
    });
  }
  // Deletes on Cloudinary Storage
  // for (let imageFilename of req.body.deleteImgs) {
  //   await cloudinary.uploader.destroy(imageFilename);
  // }
  // Deletes on Local Storage, Remove when switching to cloudinary storage
  for (let image of req.body.deleteImgs) {
    fs.unlink(path.join(__dirname, "../public/temp/uploads", image), (err) => {
      if (err) {
        throw new expressError("Internal Error", 500);
      }
    });
  }

  res.redirect(`/furniture/${req.params.id}`);
};

module.exports.delete = async (req, res) => {
  // Find object for it to delete on Cloudinary Storage or Local Storage
  const furnitureToDel = await Furniture.findById(req.params.id);
  // Deletes on Cloudinary Storage
  // for (let image of furnitureToDel.imageurl) {
  //   await cloudinary.uploader.destroy(image.filename);
  // }
  // Deletes on Local Storage, Remove when switching to cloudinary storage
  for (let image of furnitureToDel.imageurl) {
    fs.unlink(path.join(__dirname, "../public/", image.url), (err) => {
      if (err) {
        throw new expressError("Internal Error", 500);
        // console.error(err);
        // return;
      }
    });
  }
  // This deletes the questions with post Middleware that executes after findOneAndDelete in dbFurniture Schema
  await Furniture.findByIdAndDelete(req.params.id);
  // File delete on Local or Cloudinary can be added to middleware, like deleting questions of said furniture
  res.redirect("/furniture");
};
