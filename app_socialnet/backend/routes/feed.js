const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

router.post(
  "/post",
  isAuth,
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.postPost
);

router.get("/post/:id", isAuth, feedController.getPost);

router.put(
  "/post/:id",
  isAuth,
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
