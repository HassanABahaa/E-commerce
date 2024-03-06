import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as cartController from "./cart.controller.js";
import * as cartSchema from "./cart.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";

const router = Router();

// Add to cart
router.post(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.addToCart),
  asyncHandler(cartController.addToCart)
);

// Get user cart
router.get(
  "/",
  isAuthenticated,
  isAuthorized("user", "admin"),
  validation(cartSchema.userCart),
  asyncHandler(cartController.userCart)
);

// update cart
router.patch(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.updateCart),
  asyncHandler(cartController.updateCart)
);

// remove product from cart
router.patch(
  "/:productId",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.removeFromCart),
  asyncHandler(cartController.removeFromCart)
);

// clear cart
router.put(
  "/clear",
  isAuthenticated,
  isAuthorized("user"),
  asyncHandler(cartController.clearCart)
);
export default router;
