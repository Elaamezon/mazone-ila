const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.use(express.json());

/* =========================
   MongoDB
========================= */

mongoose.connect(
  "mongodb+srv://admin:123456Aa@cluster0.abcd1.mongodb.net/shop",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Error:", err.message));

/* =========================
   Models
========================= */

const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  image: String,
});

const Order = mongoose.model("Order", {
  items: Array,
  total: Number,
  customer: Object,
});

// 👇 اصلاح مهم: پیام پشتیبانی باید جواب هم داشته باشد
const Support = mongoose.model("Support", {
  name: String,
  msg: String,
  reply: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================
   Upload
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
   Pages (اصلاح مسیرها)
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
    const product = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      image: "/uploads/" + req.file.filename,
    });

    await product.save();
    res.json({ success: true });
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
   Support (اصلاح مهم)
========================= */

// ارسال پیام
app.post("/support", async (req, res) => {
  const support = new Support({
    name: req.body.name,
    msg: req.body.msg,
  });

  await support.save();
  res.json({ success: true });
});

// گرفتن پیام‌ها
app.get("/support", async (req, res) => {
  const supports = await Support.find().sort({ createdAt: -1 });
  res.json(supports);
});

// جواب دادن ادمین
app.post("/support/reply/:id", async (req, res) => {
  await Support.findByIdAndUpdate(req.params.id, {
    reply: req.body.reply
  });

  res.json({ success: true });
});

// حذف پیام
app.delete("/support/:id", async (req, res) => {
  await Support.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =========================
   Start
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
