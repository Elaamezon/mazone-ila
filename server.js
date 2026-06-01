const express = require("express");
const path = require("path");

const app = express();

/* =========================
   Middleware
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   دیتابیس موقت (RAM)
========================= */

let products = [];
let orders = [];
let supports = [];

/* =========================
   محصولات
========================= */

app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price) {
    return res.json({ success: false, message: "اطلاعات ناقص" });
  }

  const product = {
    id: Date.now().toString(),
    name,
    price: Number(price),
    image: image || "https://via.placeholder.com/300"
  };

  products.push(product);

  res.json({ success: true, product });
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.delete("/delete-product/:id", (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

/* =========================
   سفارش‌ها
========================= */

app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now().toString(),
    items: req.body.items || [],
    total: req.body.total || 0,
    customer: req.body.customer || {},
    createdAt: new Date()
  };

  orders.push(order);

  res.json({ success: true, order });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.delete("/delete-order/:id", (req, res) => {
  orders = orders.filter(o => o.id !== req.params.id);
  res.json({ success: true });
});

/* =========================
   پشتیبانی دوطرفه
========================= */

app.post("/support", (req, res) => {
  const { name, msg } = req.body;

  if (!name || !msg) {
    return res.json({ success: false });
  }

  const support = {
    id: Date.now().toString(),
    name,
    msg,
    reply: "",
    createdAt: new Date()
  };

  supports.push(support);

  res.json({ success: true, support });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

app.post("/support/reply/:id", (req, res) => {
  const support = supports.find(s => s.id === req.params.id);

  if (!support) {
    return res.json({ success: false });
  }

  support.reply = req.body.reply;

  res.json({ success: true });
});

app.delete("/support/:id", (req, res) => {
  supports = supports.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

/* =========================
   تست سرور
========================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Server is working 🚀"
  });
});

/* =========================
   اجرا
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
