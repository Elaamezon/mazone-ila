const express = require("express");
const path = require("path");

const app = express();

/* =========================
   Static files
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   Home page
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   Test route
========================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Server is working 🚀"
  });
});

/* =========================
   Start server (Render)
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});

