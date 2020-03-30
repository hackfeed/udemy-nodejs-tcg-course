const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

users = [];

app.get("/", (req, res, next) => {
  res.render("index", { pageTitle: "Add user" });
});

app.post("/", (req, res, next) => {
  users.push({ username: req.body.username });
  res.redirect("/");
});

app.get("/users", (req, res, next) => {
  res.render("users", { pageTitle: "Users", usersList: users });
});

app.listen(3000);
