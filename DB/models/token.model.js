import { Schema, Types, model } from "mongoose";

const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "user" },
    isValid: { type: Boolean, default: true },
    agent: String,
    expiresAt: String,
  },
  { timestamps: true }
);

export const Token = model("Token", tokenSchema);
