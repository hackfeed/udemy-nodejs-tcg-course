const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { MailgunTransport } = require("mailgun-nodemailer-transport");
const crypto = require("crypto");

const User = require("../models/user");

let transporter = nodemailer.createTransport(
  new MailgunTransport({
    auth: {
      domain: "pasteyours",
      apiKey: "pasteyours",
    },
  })
);

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
        .then(() => {
          res.redirect("/signin");
          return transporter.sendMail({
            to: email,
            from: "hackfeedshop@noreply.com",
            subject: "Signup succeeded!",
            text: "You just signed up to my shop!",
          });
        });
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset password",
    path: "/reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redircet("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account linked to given email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save().then(() => {
          res.redirect("/");
          return transporter.sendMail({
            to: req.body.email,
            from: "hackfeedshop@noreply.com",
            subject: "Password reset",
            html: `
              <p>You requested a password reset.</p>
              <p>Click this <a href="http://localhost:3000/reset/${user.resetToken}">link</a> to set a new password.</p>
            `,
          });
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length) {
        message = message[0];
      } else {
        message = null;
      }
      if (!user) {
        req.flash("error", "Password reset link has expired");
        return res.redirect("/reset");
      }
      res.render("auth/password", {
        pageTitle: "Update password",
        path: "/password",
        errorMessage: message,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then((user) => {
      let message = req.flash("error");
      if (message.length) {
        message = message[0];
      } else {
        message = null;
      }
      if (!user) {
        req.flash("error", "Password reset link has expired");
        return res.redirect("/reset");
      }
      return bcrypt.hash(password, 12).then((hashedPass) => {
        user.password = hashedPass;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        user.save().then(() => res.redirect("/signin"));
      });
    })
    .catch((err) => console.log(err));
};
