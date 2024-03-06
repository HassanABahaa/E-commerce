import { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    discription: { type: String, min: 10, max: 200 },
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true },
    cloudFolder: { type: String, unique: true, required: true },
    averageRate: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals
productSchema.virtual("finalPrice").get(function () {
  // this >>> document  / return >> final price
  // final price
  // if (this.discount > 0) return this.price - (this.price * this.discount) / 100;
  // return this.price;
  return Number.parseFloat(
    this.price - (this.price * this.discount || 0) / 100
  ).toFixed(2);
});

productSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

// query helper

// paginate
productSchema.query.paginate = function (page) {
  // this >>> query
  // paginate  >>> 2 methods 1- skip 2- limit
  // page from query , limit 20 (static) , skip?

  page = page < 1 || isNaN(page) || !page ? 1 : page;

  const limit = 20; // 1 item per page

  // // page 3 >>> 1 per page >>> skip 2 items
  const skip = limit * (page - 1); // 1*(1-1)
  return this.skip(skip).limit(limit); // this =Product.find({...req.query}).sort(sort)
};

// search
productSchema.query.search = function (keyword) {
  // this >> query
  if (keyword) {
    return this.find({
      $or: [
        { name: { regex: keyword, $option: "i" } },
        { discription: { regex: keyword, $option: "i" } },
      ],
    });
  }
  return this; // query
};

// methods
productSchema.methods.inStock = function (requiredQuantity) {
  // this >>> document >>> products
  return this.availableItems >= requiredQuantity ? true : false;
};

export const Product = model("Product", productSchema);
