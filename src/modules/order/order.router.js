import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.schema.js";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import express from "express";

const router = Router();

// create order
router.post(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(orderSchema.createOrder),
  asyncHandler(orderController.createOrder)
);

// cancel order
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("user"),
  validation(orderSchema.cancelOrder),
  asyncHandler(orderController.cancelOrder)
);

// webhook endpoint >>> from stripe

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // req.body >>> buffer data
  asyncHandler(orderController.orderWebhook)
);

export default router;
