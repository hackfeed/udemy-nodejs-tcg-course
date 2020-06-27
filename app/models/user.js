const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity += this.cart.items[cartProductIndex].quantity;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({ productId: mongodb.ObjectId(product._id), quantity: newQuantity });
    }
    const updatedCart = { items: updatedCartItems };
    return db
      .collection("users")
      .updateOne({ _id: mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => i.productId);
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) =>
        products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => i.productId.toString() === p._id.toString())
              .quantity,
          };
        })
      );
  }

  deleteItemFromCart(prodId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== prodId.toString()
    );
    return db
      .collection("users")
      .updateOne(
        { _id: mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: mongodb.ObjectId(this._id),
            name: this.name,
            email: this.email,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then(() => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne({ _id: mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
      })
      .catch((err) => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": mongodb.ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection("users").findOne({ _id: mongodb.ObjectId(userId) });
  }
}

module.exports = User;
