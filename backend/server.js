const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const wuxingRouter = require("./routes/wuxing");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Wuxing backend is running."
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/wuxing", wuxingRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({
      message: err.message
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Wuxing backend listening on port ${PORT}`);
});
