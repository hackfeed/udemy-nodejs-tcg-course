const path = require("path");

const express = require("express");

const rootDir = require("./util/path");

const app = express();

const userRoutes = require("./routes/users");

app.use(express.static(path.join(rootDir, "public")));

app.use(userRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, "views", "404.html"));
});

app.listen(3000);
