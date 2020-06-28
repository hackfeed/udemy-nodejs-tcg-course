const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity += this.cart.items[cartProductIndex].quantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== prodId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  this.save();
};

module.exports = mongoose.model("User", userSchema);
