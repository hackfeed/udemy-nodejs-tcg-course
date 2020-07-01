const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getSignin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signin", {
    pageTitle: "Sign in",
    path: "/signin",
    errorMessage: message,
  });
};

exports.postSignin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/signin");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatched) => {
          if (isMatched) {
            req.session.isSignedIn = true;
            req.session.user = user;
            return res.redirect("/");
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/signin");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Invalid email or password.");
          res.redirect("/signin");
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", { pageTitle: "Sign up", path: "/signup", errorMessage: message });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error", "User with given email already exists.");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPass) => {
          const newUser = new User({ email: email, password: hashedPass, cart: { items: [] } });
          return newUser.save();
        })
        .then(() => res.redirect("/signin"));
    })
    .catch((err) => console.log(err));
};
