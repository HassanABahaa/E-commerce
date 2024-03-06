import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import cloudinary from "../../utils/cloud.js";
import slugify from "slugify";

export const createSubcategory = async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not Found!", { cause: 404 }));
  // check file
  if (!req.file)
    return next(new Error("Subcategory image is required", { cause: 400 }));

  // upload image to cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/subcategory`,
    }
  );
  // save Subcategory in DB
  await Subcategory.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    category: req.params.category,
  });
  // return response
  return res.json({ success: true, msg: "Subcategory created successfully!" });
};

export const updateSubcategory = async (req, res, next) => {
  // check category in DB
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory in DB
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("Subcategory not found!", { cause: 404 }));

  // check if category is the parent of subcategory (هنا او في الكوندشن بتاع السبكاتيجوري)

  // check usbcategory owner
  if (req.user._id.toString() !== subcategory.createdBy.toString())
    return next(new Error("Not allowed to update subcategory!"));
  // check file >> upload in cloudinary
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: subcategory.image.id }
    );
    subcategory.image = { id: public_id, url: secure_url };
  }
  // update category
  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
  // save subcategory
  await subcategory.save();
  // send response
  return res.json({ success: true, msg: "Subcategory updated successfully!" });
};

export const deleteSubcategory = async (req, res, next) => {
  // check category in DB
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory in DB
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("Subcategory not found!", { cause: 404 }));

  // check owner
  if (subcategory.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not allowed to delete!"));

  // delete subcategory from DB
  // await subcategory.remove(); // hooks mongoose
  // await subcategory.deleteOne();
  await Subcategory.findOneAndDelete(req.params.id);

  // delete image from cloudinary
  await cloudinary.uploader.destroy(subcategory.image.id);
  // return response
  return res.json({ success: true, msg: "Subcategory deleted successfully!" });
};

export const allSubcategories = async (req, res, next) => {
  if (req.params.category) {
    // all subcategories of certain category
    const Subcategories = await Subcategory.find({
      category: req.params.category,
    });
    return res.json({ success: true, Subcategories });
  }

  const Subcategories = await Subcategory.find();
  return res.json({ success: true, Subcategories });
};
