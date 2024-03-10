import express from "express";
import { connectDB } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import categoryRouter from "./src/modules/category/category.router.js";
import subcategoryRouter from "./src/modules/subcategory/subcategory.router.js";
import brandRouter from "./src/modules/brand/brand.router.js";
import couponRouter from "./src/modules/coupon/coupon.router.js";
import productRouter from "./src/modules/product/product.router.js";
import cartRouter from "./src/modules/cart/cart.router.js";
import orderRouter from "./src/modules/order/order.router.js";
import reviewRouter from "./src/modules/review/review.router.js";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();

const app = express();
const port = process.env.PORT;

// CORS
const whiteList = ["http://127.0.0.1:3000"];
app.use((req, res, next) => {
  console.log(req.header("origin"));

  if (req.originalUrl.includes("/auth/activate_account")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    return next();
  }

  if (!whiteList.includes(req.header("origin")))
    return next(new Error("Blocked by CORS!"));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
<<<<<<< HEAD
  res.setHeader("Access-Control-Allow-Methods", "*"); // "*" >> "POST"
=======
  res.setHeader("Access-Control-Allow-Methods", "*"); 
>>>>>>> 165138b5979433025d7a5a107e0736a7823afcdc
  res.setHeader("Access-Control-Private-Network", true);

  return next();
});

// morgan
app.use(morgan("combined"));

// parsing
app.use(express.json());

// connect DB
await connectDB();

// APIs
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/subcategory", subcategoryRouter);
app.use("/brand", brandRouter);
app.use("/coupon", couponRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/review", reviewRouter);

// page not found handler
app.all("*", (req, res, next) => {
  return next(new Error("Page not found!", { cause: 404 }));
});

// global error handler
app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;
  return res
    .status(statusCode)
    .json({ success: false, msg: error.message, stack: error.stack });
});

app.listen(port, () => console.log("App is listening at port:", port));
