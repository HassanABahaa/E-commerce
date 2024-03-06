import { Schema, Types, model } from "mongoose";

const cartShema = new Schema(
  {
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
  },
  { timestamps: true }
);

export const Cart = model("Cart", cartShema);
