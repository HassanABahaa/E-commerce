import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as brandController from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";

const router = Router();

// CRUD

// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.createBrand),
  asyncHandler(brandController.createBrand)
);

// update
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.updateBrand),
  asyncHandler(brandController.updateBrand)
);

// delete
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(brandSchema.deleteBrand),
  asyncHandler(brandController.deleteBrand)
);

// get
router.get("/", asyncHandler(brandController.getBrand));
export default router;
