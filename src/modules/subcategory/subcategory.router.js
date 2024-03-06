import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as subcategorySchema from "./subcategory.schema.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as subcategoryController from "./subcategory.controller.js";

const router = Router({ mergeParams: true });

// http://localhost:3000/category/:categoryId/subcategory
// CRUD

// create category
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("subcategory"),
  validation(subcategorySchema.createSubcategory),
  asyncHandler(subcategoryController.createSubcategory)
);

// update category
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("subcategory"),
  validation(subcategorySchema.updateSubcategory),
  asyncHandler(subcategoryController.updateSubcategory)
);

// delete category
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(subcategorySchema.deleteSubcategory),
  asyncHandler(subcategoryController.deleteSubcategory)
);

// all subcategories
router.get("/", validation(subcategorySchema.allSubcategories),asyncHandler(subcategoryController.allSubcategories));

export default router;
