const express = require("express");
const app = express();

// 👇 ADD THIS BLOCK (VERY IMPORTANT)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
