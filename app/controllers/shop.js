const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: "Product detail",
        product: product,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  User.findById(req.session.user._id).then((user) => {
    user
      .populate("cart.items.productId")
      .execPopulate()
      .then((user) => {
        const products = user.cart.items;
        res.render("shop/cart", {
          pageTitle: "Your Cart",
          path: "/cart",
          products: products,
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById(req.session.user._id).then((user) => {
    Product.findById(prodId)
      .then((product) => user.addToCart(product))
      .then(() => res.redirect("/cart"))
      .catch((err) => console.log(err));
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById(req.session.user._id).then((user) => {
    user
      .removeFromCart(prodId)
      .then(() => res.redirect("/cart"))
      .catch((err) => console.log(err));
  });
};

exports.postOrder = (req, res, next) => {
  User.findById(req.session.user._id).then((user) => {
    user
      .populate("cart.items.productId")
      .execPopulate()
      .then((user) => {
        const products = user.cart.items.map((i) => {
          return { quantity: i.quantity, productData: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            name: user.name,
            userId: user,
          },
          products: products,
        });
        return order.save();
      })
      .then(() => user.clearCart())
      .then(() => res.redirect("/orders"))
      .catch((err) => console.log(err));
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) =>
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      })
    )
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};
