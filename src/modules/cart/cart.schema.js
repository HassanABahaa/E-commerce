import joi from "joi";
import { objectIdValidation } from "../../middleware/validation.middleware.js";

export const addToCart = joi
  .object({
    productId: joi.string().custom(objectIdValidation).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const userCart = joi
  .object({
    cartId: joi.string().custom(objectIdValidation),
  })
  .required();

export const updateCart = joi
  .object({
    productId: joi.string().custom(objectIdValidation).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const removeFromCart = joi
  .object({ productId: joi.string().custom(objectIdValidation).required() })
  .required();
