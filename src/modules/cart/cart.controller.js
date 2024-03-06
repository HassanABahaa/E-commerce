import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock
  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry, Only ${product.availableItems} items are available`)
    );

  // check product existence in cart
  const isProductInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  });
  if (isProductInCart) {
    const theProduct = isProductInCart.products.find((prd) => {
      prd.productId.toString() === productId.toString();
    });

    // check stock
    if (product.inStock(theProduct.quantity + quantity)) {
      theProduct.quantity = theProduct.quantity + quantity;
      await isProductInCart.save();
      return res.json({ success: true, results: { cart: isProductInCart } });
    } else {
      return next(
        new Error(`sorry, only ${product.availableItems} items are available!`)
      );
    }
  }

  // add product to products array in the cart
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $push: { products: { productId, quantity } } },
    { new: true }
  );
  return res.json({ success: true, cart });
};

export const userCart = async (req, res, next) => {
  if (req.user.role == "user") {
    const cart = await Cart.findOne({ user: req.user._id });
    return res.json({ success: true, cart });
  }
  if (req.user.role == "admin" && !req.body.cart)
    return next(new Error("Cart id is required"));
  const cart = await Cart.findById(req.body.cartId);
  return res.json({ success: true, cart });
};

export const updateCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));
  // check stock
  if (quantity > product.availableItems)
    return next(
      new Error(`Sorry, Only ${product.availableItems} items are available`)
    );

  // update cart
  const cart = await Cart.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    { "products.$.quantity": quantity },
    { new: true }
  );
  return res.json({ success: true, result: { cart } });
};

export const removeFromCart = async (req, res, next) => {
  // check product
  const { productId } = req.params;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));
  // remove product from cart
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { productId } } },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
};

export const clearCart = async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
};
