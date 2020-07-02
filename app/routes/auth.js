const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signin", authController.getSignin);

router.post("/signin", authController.postSignin);

router.post("/signout", authController.postSignout);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getPassword);

router.post("/password", authController.postPassword);

module.exports = router;
