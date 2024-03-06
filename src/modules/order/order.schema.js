import joi from "joi";
import { objectIdValidation } from "../../middleware/validation.middleware.js";

export const createOrder = joi
  .object({
    phone: joi.string().required(),
    address: joi.string().required(),
    payment: joi.string().valid("cash", "visa"),
    coupon: joi.string().length(5),
  })
  .required();

export const cancelOrder = joi
  .object({
    id: joi.string().custom(objectIdValidation).required(),
  })
  .required();
