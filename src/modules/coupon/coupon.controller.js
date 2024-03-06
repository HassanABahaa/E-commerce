import voucher_code from "voucher-code-generator";
import { Coupon } from "../../../DB/models/coupon.model.js";

export const createCoupon = async (req, res, next) => {
  // generate code
  const code = voucher_code.generate({ length: 5 }); // ["123sd"]
  // create coupon in DB
  const coupon = await Coupon.create({
    name: code[0],
    createdBy: req.user._id,
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(),
  });
  // send response
  return res.status(201).json({ success: true, results: coupon });
};

export const updateCoupon = async (req, res, next) => {
  // check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });
  if (!coupon) return next(new Error("Invalid coupon!", { cause: 404 }));
  // check owner
  if (req.user.id !== coupon.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 403 }));
  // update coupon
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt)
    : coupon.expiredAt;
  await coupon.save();
  // send response
  return res.json({ success: true, msg: "Coupon updated successfully" });
};

export const deleteCoupon = async (req, res, next) => {
  // check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
  });
  if (!coupon) return next(new Error("Invalid coupon!", { cause: 404 }));
  // check owner
  if (req.user.id !== coupon.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 403 }));
  // delete coupon
  await coupon.deleteOne();

  // response
  return res.json({ success: true, msg: "Coupon delete successfully" });
};

export const allCoupons = async (req, res, next) => {
  // admin >>> all coupons
  if (req.user.role === "admin") {
    const coupons = await Coupon.find();
    return res.json({ success: true, coupons });
  }
  // seller >>> his coupons
  if (req.user.role === "seller") {
    const coupons = await Coupon.find({ createdBy: req.user._id });
    return res.json({ success: true, coupons });
  }
};
