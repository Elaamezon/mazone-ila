const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   دیتابیس موقت (بدون Mongo برای جلوگیری از خطا)
========================= */

let products = [];
let orders = [];
let supports = [];

/* =========================
   محصولات
========================= */

app.post("/add-product", (req, res) => {
  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    image: req.body.image || "https://via.placeholder.com/200"
  };

  products.push(product);

  res.json({ success: true });
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.delete("/delete-product/:id", (req, res) => {
  products = products.filter(p => p.id != req.params.id);
  res.json({ success: true });
});

/* =========================
   سفارش‌ها
========================= */

app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer
  };

  orders.push(order);

  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.delete("/delete-order/:id", (req, res) => {
  orders = orders.filter(o => o.id != req.params.id);
  res.json({ success: true });
});

/* =========================
   پشتیبانی دوطرفه
========================= */

app.post("/support", (req, res) => {
  const msg = {
    id: Date.now(),
    name: req.body.name,
    msg: req.body.msg,
    reply: ""
  };

  supports.push(msg);

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

app.post("/support/reply/:id", (req, res) => {
  const s = supports.find(x => x.id == req.params.id);

  if (s) {
    s.reply = req.body.reply;
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
