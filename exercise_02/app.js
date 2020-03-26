const express = require("express");

const app = express();

// app.use((req, res, next) => {
//   console.log("First middleware");
//   next();
// });

// app.use((req, res, next) => {
//   console.log("Second middleware");
//   res.send("<p>Last station bruh!</p>");
// });

app.use("/users", (req, res, next) => {
  res.send("<h1>Users page</h1>");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Home page</h1>");
});

app.listen(3000);
