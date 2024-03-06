import joi from "joi";

// Register
export const register = joi
  .object({
    userName: joi.string().min(2).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();

// Activate account
export const activateAccount = joi
  .object({
    token: joi.string().required(),
  })
  .required();

// Login
export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

// froget code
export const forgetCode = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

//  reset password
export const resetPassword = joi
  .object({
    email: joi.string().email().required(),
    forgetCode: joi.string().length(5).required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
