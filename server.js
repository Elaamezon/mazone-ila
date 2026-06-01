const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   دیتابیس ساده (حرفه‌ای‌تر)
========================= */

let products = [];
let orders = [];
let supports = [];

/* =========================
   محصولات
========================= */

app.post("/add-product", (req, res) => {
  const product = {
    id: Date.now().toString(),
    name: req.body.name,
    price: Number(req.body.price),
    image: req.body.image || "https://via.placeholder.com/300"
  };

  products.push(product);

  res.json({ success: true });
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.delete("/delete-product/:id", (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

/* =========================
   سفارش‌ها (سبد خرید واقعی)
========================= */

app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now().toString(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
    status: "pending"
  };

  orders.push(order);

  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

/* =========================
   پشتیبانی دوطرفه واقعی
========================= */

app.post("/support", (req, res) => {
  const msg = {
    id: Date.now().toString(),
    name: req.body.name,
    msg: req.body.msg,
    reply: "",
    createdAt: new Date()
  };

  supports.push(msg);

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

/* پاسخ ادمین */
app.post("/support/reply/:id", (req, res) => {
  const msg = supports.find(s => s.id === req.params.id);

  if (msg) {
    msg.reply = req.body.reply;
  }

  res.json({ success: true });
});

/* =========================
   Start
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on " + PORT);
});
