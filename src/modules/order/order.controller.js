import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import cloudinary from "../../utils/cloud.js";
import createInvoice from "../../utils/pdfInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = async (req, res, next) => {
  // data
  const { payment, address, phone, coupon } = req.body;

  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
  }
  if (!checkCoupon) return next(new Error("Invalid coupon", { cause: 400 }));

  // get products from cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;

  if (products.lenght < 1) return next(new Error("Empty cart!"));

  // check products
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`${products[i].productId} product not found!`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `Product out of stock, only ${product.availableItems} are available`
        )
      );
    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });
    orderPrice += product.finalPrice;
  }

  // create order in DB
  const order = await Order.create({
    user: req.user._id,
    payment,
    address,
    phone,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });
  // create invoice
  const invoice = {
    shipping: {
      name: req.user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price, // before discount
    paid: order.finalPrice, // after discount
    invoice_nr: order._id,
  };

  const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);

  createInvoice(invoice, pdfPath);

  // upload invoice to cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUD_FOLDER_NAME}/order/invoices`,
  });

  // add invoice in DB "file" url , id
  order.invoice = { url: secure_url, id: public_id };
  await order.save();

  // send email to user "invoice"
  const isSent = await sendEmail({
    to: req.user.email,
    subject: "Order invoice",
    attachments: [{ path: secure_url, contentType: "applicataion/pdf" }],
  });

  if (!isSent) return next(new Error("Something went wrong!"));

  // update stock
  updateStock(order.products, true);

  // clear cart
  clearCart(req.user._id);

  if (payment === "visa") {
    // stripe gateway

    const stripe = new Stripe(process.env.STRIPE_KEY);

    // coupon stripe
    let couponExisted;
    if (order.coupon.name !== undefined) {
      couponExisted = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
<<<<<<< HEAD
      payment_method_types: ["card"], // card = visa
      mode: "payment", // payment , subscription
      metadata: { order_id: order._id.toString() },
      success_url: process.env.SUCCESS_URL, // from frontend
      cancel_url: process.env.CANCEL_URL, // from frontend
=======
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
>>>>>>> 165138b5979433025d7a5a107e0736a7823afcdc
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url],
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExisted ? [{ coupon: couponExisted.id }] : [],
    });
    return res.json({ success: true, results: { url: session.url } });
  }
  // send response
  return res.json({ success: true, results: { order } });
};

export const cancelOrder = async (req, res, next) => {
  // check order
  const order = await Order.findById(req.params.id);
  if (!order) return next(new Error("Invalid order id ", { cause: 400 }));
  // check status
  if (!order === "placed") return next(new Error("Can't cancel the order!"));

  // cancel order
  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  // send response
  return res.json({ success: true, msg: "Order canceled successfully!" });
};

/// Webhook
export const orderWebhook = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    // change order status ???
    await Order.findOneAndUpdate({ _id: orderId }, { status: "visa payed" });
    return;
  }

  await Order.findOneAndUpdate({ _id: orderId }, { status: "failed to pay" });
  return;

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
