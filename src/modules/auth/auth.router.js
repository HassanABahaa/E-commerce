import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as authController from "./auth.controller.js";
import * as authSchema from "./auth.schema.js";
const router = Router();

// Register
router.post(
  "/register",
  validation(authSchema.register),
  asyncHandler(authController.register)
);

// Activate account
router.get(
  "/activate_account/:token",
  validation(authSchema.activateAccount),
  asyncHandler(authController.activateAccount)
);

// Login
router.post(
  "/login",
  validation(authSchema.login),
  asyncHandler(authController.login)
);

// send forget code
router.patch(
  "/forgetCode",
  validation(authSchema.forgetCode),
  asyncHandler(authController.forgetCode)
);

// reset password
router.patch(
  "/resetPassword",
  validation(authSchema.resetPassword),
  asyncHandler(authController.resetPassword)
);

export default router;
