import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { resetPassTemp, signUpTemp } from "../../utils/htmlTemplates.js";
import { Token } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

// register
export const register = async (req, res, next) => {
  // data from request
  const { userName, email, password } = req.body;

  // check user existence
  const user = await User.findOne({ email });
  if (user) return next(new Error("User already exist!", { cause: 409 }));

  // generate token
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);

  // create user
  await User.create({ ...req.body }); // create >> save()

  // create confirmation link
  const confirmationLink = `http://localhost:3000/auth/activate_account/${token}`;

  // send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: signUpTemp(confirmationLink),
  });

  if (!messageSent) return next(new Error());

  // send response
  return res.status(201).json({ success: true, msg: "Check your email!" });
};

// activate account
export const activateAccount = async (req, res, next) => {
  const { token } = req.params;
  const { email } = jwt.verify(token, process.env.TOKEN_SECRET);
  // find user , update isConfirmed
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });

  // check if the user doesn't exist
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // create cart
  await Cart.create({ user: user._id });

  // send response
  return res.json({ success: true, message: "Try to login!" });
};

// login
export const login = async (req, res, next) => {
  // data from request
  const { email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email!", { cause: 404 }));
  // check isConfirmed
  if (!user.isConfirmed)
    return next(new Error("Activate your account to login!"));
  // check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("Incorrect password!"));
  // generate token
  const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
  // save token in DB
  await Token.create({ token, user: user._id });
  // send response
  return res.status(200).json({ success: true, token });
};

// forget code
export const forgetCode = async (req, res, next) => {
  // data from request
  const { email } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email!", { cause: 404 }));
  // generate forget code
  const forgetCode = randomstring.generate({ charset: "numeric", length: 5 });
  // save forget code to user
  user.forgetCode = forgetCode;
  await user.save();
  // send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Reset password",
    html: resetPassTemp(forgetCode),
  });

  if (!messageSent) return next(new Error("Something went wrong!"));

  // send response >> redirect frontend "form >> forgetCode new password"
  return res.json({ success: true, msg: "Check your email" });
};

// reset password
export const resetPassword = async (req, res, next) => {
  // data from requeset
  const { email, password, forgetCode } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email", { cause: 404 }));
  // check the forgetCode
  if (forgetCode !== user.forgetCode)
    return next(new Error("Code is invalid!"));
  // hash Password and save user
  user.password = bcryptjs.hashSync(password, parseInt(process.env.SALT_ROUND));
  await user.save();
  // find all token of the user
  const tokens = await Token.find({ user: user._id });
  // invalidate all tokens
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  // send response // redirect login frontend
  return res.json({ success: true, msg: "Try to login!" });
};
