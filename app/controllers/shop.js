const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }

  const page = +req.query.page || 1;
  let totalProducts;

  Product.find()
    .count()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        errorMessage: message,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;

  Product.find()
    .count()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: "Product detail",
        product: product,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById(req.session.user._id).then((user) => {
    Product.findById(prodId)
      .then((product) => user.addToCart(product))
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById(req.session.user._id).then((user) => {
    user
      .removeFromCart(prodId)
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
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
            email: user.email,
            userId: user,
          },
          products: products,
        });
        return order.save();
      })
      .then(() => user.clearCart())
      .then(() => res.redirect("/orders"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) =>
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.session.user._id.toString()) {
        return next(new Error("Unautrhorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        align: "center",
      });
      pdfDoc.text("--------------------", {
        align: "center",
      });

      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.productData.price;
        pdfDoc
          .fontSize(14)
          .text(prod.productData.title + " - " + prod.quantity + " x $" + prod.productData.price);
      });
      pdfDoc.fontSize(26).text("--------------------", {
        align: "center",
      });
      pdfDoc.fontSize(20).text("Total price: $" + totalPrice, {
        align: "center",
      });

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
