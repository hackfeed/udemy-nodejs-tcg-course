const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signin", authController.getSignin);

router.post("/signin", authController.postSignin);

router.post("/signout", authController.postSignout);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

module.exports = router;
