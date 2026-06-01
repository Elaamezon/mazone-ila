const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();

/* =========================
   Middleware
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   MongoDB (فعلاً خاموش برای جلوگیری از کرش)
========================= */

/*
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.log("❌ MongoDB Error:", err.message);
});
*/

/* =========================
   Models
========================= */

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  customer: Object,
});

const SupportSchema = new mongoose.Schema({
  name: String,
  msg: String,
  reply: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);
const Support = mongoose.model("Support", SupportSchema);

/* =========================
   Upload setup
========================= */

const uploadDir = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   Pages
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* =========================
   Products
========================= */

app.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: "No image" });
    }

    const product = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      image: "/uploads/" + req.file.filename,
    });

    await product.save();

    res.json({ success: true, product });

  } catch (err) {
    res.json({ success: false, error: err.message });
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
   Orders
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
   Support (دوطرفه)
========================= */

app.post("/support", async (req, res) => {
  const support = new Support({
    name: req.body.name,
    msg: req.body.msg,
  });

  await support.save();
  res.json({ success: true });
});

app.get("/support", async (req, res) => {
  const data = await Support.find().sort({ createdAt: -1 });
  res.json(data);
});

app.post("/support/reply/:id", async (req, res) => {
  await Support.findByIdAndUpdate(req.params.id, {
    reply: req.body.reply,
  });

  res.json({ success: true });
});

app.delete("/support/:id", async (req, res) => {
  await Support.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
