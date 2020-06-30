const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", { pageTitle: "Login", path: "/login", isAuthenticated: false });
};

exports.postLogin = (req, res, next) => {
  User.findById("5ef8c31a3873baa7e529a34e")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
