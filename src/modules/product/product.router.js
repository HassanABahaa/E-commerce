import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as productController from "./product.controller.js";
import * as productSchema from "./product.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import reviewRouter from "./../review/review.router.js";

const router = Router();

router.use("/:productId/review", reviewRouter);

// create product
router.post(
  "/",
  isAuthenticated,
  isAuthorized("seller"),
  fileUpload().fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  validation(productSchema.createProduct),
  asyncHandler(productController.createProduct)
);

// delete product
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("seller"),
  validation(productSchema.deleteProduct),
  asyncHandler(productController.deleteProduct)
);

// get products
router.get("/", asyncHandler(productController.allProducts));

export default router;
