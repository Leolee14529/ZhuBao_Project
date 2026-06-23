const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = router;
