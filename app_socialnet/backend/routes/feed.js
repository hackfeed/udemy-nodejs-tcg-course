const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);

router.post(
  "/post",
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.postPost
);

router.get("/post/:id", feedController.getPost);

router.put(
  "/post/:id",
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.updatePost
);

router.delete("/post/:postId", feedController.deletePost);

module.exports = router;
