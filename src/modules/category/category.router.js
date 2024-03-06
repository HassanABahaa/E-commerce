import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";

const router = Router();

// localhost:3000/category
router.use("/:category/subcategory", subcategoryRouter);

// CRUD

// create category
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.createCategory),
  asyncHandler(categoryController.createCategory)
);

// update category
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.updateCategory),
  asyncHandler(categoryController.updateCategory)
);

// delete category
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(categorySchema.deleteCategory),
  asyncHandler(categoryController.deleteCategory)
);

// get all categories
router.get("/", asyncHandler(categoryController.allCategories));

export default router;
