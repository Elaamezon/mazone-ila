```js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.use(express.json());

/* =========================
   MongoDB (SAFE CONNECT)
========================= */

mongoose.connect(
  "mongodb+srv://admin:123456Aa@cluster0.abcd1.mongodb.net/shop"
)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.log("❌ MongoDB Error:", err.message);
});

/* =========================
   MODELS
========================= */

const Product = mongoose.model("Product", {
  name: String,
  price: String,
  image: String,
});

const Order = mongoose.model("Order", {
  items: Array,
  total: Number,
  customer: Object,
});

const Support = mongoose.model("Support", {
  name: String,
  msg: String,
});

/* =========================
   UPLOAD
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   PAGES
========================= */

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/admin.html", (req, res) => {
  res.sendFile(__dirname + "/admin.html");
});

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

/* =========================
   PRODUCTS
========================= */

app.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: "/uploads/" + req.file.filename,
    });

    await product.save();

    res.json({ success: true });

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.delete("/delete-product/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =========================
   ORDERS
========================= */

app.post("/create-order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json({ success: true });
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.delete("/delete-order/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =========================
   SUPPORT
========================= */

app.post("/support", async (req, res) => {
  const support = new Support(req.body);
  await support.save();
  res.json({ success: true });
});

app.get("/support", async (req, res) => {
  const supports = await Support.find();
  res.json(supports);
});

app.delete("/support/:id", async (req, res) => {
  await Support.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
```
