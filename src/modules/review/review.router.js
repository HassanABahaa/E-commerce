import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as reviewController from "./review.controller.js";
import * as reviewSchema from "./review.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";

const router = Router({ mergeParams: true });

// add review
router.post(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(reviewSchema.addReview),
  asyncHandler(reviewController.addReview)
);

// update review
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("user"),
  validation(reviewSchema.updateReview),
  asyncHandler(reviewController.updateReview)
);

export default router;
