import joi from "joi";
import { objectIdValidation } from "../../middleware/validation.middleware.js";

export const addReview = joi
  .object({
    productId: joi.string().custom(objectIdValidation).required(),
    comment: joi.string().required(),
    rating: joi.number().min(1).max(5).required(),
  })
  .required();
export const updateReview = joi
  .object({
    id: joi.string().custom(objectIdValidation).required(),
    productId: joi.string().custom(objectIdValidation).required(),
    comment: joi.string(),
    rating: joi.number().min(1).max(5),
  })
  .required();
