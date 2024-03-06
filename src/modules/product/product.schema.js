import joi from "joi";
import { objectIdValidation } from "../../middleware/validation.middleware.js";

export const createProduct = joi
  .object({
    name: joi.string().min(2).max(20).required(),
    discription: joi.string().min(10).max(200),
    availableItems: joi.number().integer().min(1).required(),
    price: joi.number().integer().min(1).required(),
    discount: joi.number().min(1).max(100),
    category: joi.string().custom(objectIdValidation).required(true),
    subcategory: joi.string().custom(objectIdValidation).required(true),
    brand: joi.string().custom(objectIdValidation).required(true),
  })
  .required();

export const deleteProduct = joi
  .object({
    id: joi.string().custom(objectIdValidation).required(),
  })
  .required();
