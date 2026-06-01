const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* =========================
   Middleware
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   دیتابیس ساده
========================= */

let products = [];
let orders = [];
let supports = [];
let messages = []; // چت واتساپ

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
   سفارش‌ها
========================= */

app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now().toString(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
    createdAt: new Date()
  };

  orders.push(order);
  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.delete("/delete-order/:id", (req, res) => {
  orders = orders.filter(o => o.id !== req.params.id);
  res.json({ success: true });
});

/* =========================
   پشتیبانی ساده
========================= */

app.post("/support", (req, res) => {
  const msg = {
    id: Date.now().toString(),
    name: req.body.name,
    msg: req.body.msg,
    reply: ""
  };

  supports.push(msg);
  io.emit("support_update", supports);

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

app.post("/support/reply/:id", (req, res) => {
  const msg = supports.find(m => m.id === req.params.id);
  if (msg) msg.reply = req.body.reply;

  io.emit("support_update", supports);
  res.json({ success: true });
});

app.delete("/support/:id", (req, res) => {
  supports = supports.filter(m => m.id !== req.params.id);
  io.emit("support_update", supports);
  res.json({ success: true });
});

/* =========================
   💬 چت واتساپ واقعی
========================= */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("chat_history", messages);

  socket.on("send_message", (data) => {
    const msg = {
      id: Date.now().toString(),
      text: data.text,
      sender: data.sender,
      time: new Date().toLocaleTimeString()
    };

    messages.push(msg);
    io.emit("new_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* =========================
   Start
========================= */

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("🚀 Server running on " + PORT);
});
