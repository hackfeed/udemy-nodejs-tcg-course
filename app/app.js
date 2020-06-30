const path = require("path");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongodbStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const store = new MongodbStore({
  uri: "mongodb://localhost:27017/shop",
  collection: "sessions",
});

app.set("view engine", "pug");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: "mysecretflexing", resave: false, saveUninitialized: false, store: store })
);

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect("mongodb://localhost:27017/shop").then(() => {
  User.findOne().then((user) => {
    if (!user) {
      const user = new User({
        name: "Sergey",
        email: "test@test.com",
        cart: {
          items: [],
        },
      });
      user.save();
    }
  });
  app.listen(3000);
});
