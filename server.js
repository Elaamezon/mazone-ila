const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* =========================
   Socket.io (Chat WhatsApp)
========================= */
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

/* =========================
   Middleware
========================= */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   Database (Simple Memory)
========================= */

let products = [];
let orders = [];
let supports = [];
let messages = []; // chat

/* =========================
   🛒 Products
========================= */

app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price) {
    return res.json({ success: false, message: "Invalid data" });
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
   🧾 Orders
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
   💬 Support (Ticket style)
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

  io.emit("support_update", supports);

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

app.post("/support/reply/:id", (req, res) => {
  const msg = supports.find(m => m.id === req.params.id);

  if (msg) {
    msg.reply = req.body.reply;
  }

  io.emit("support_update", supports);

  res.json({ success: true });
});

app.delete("/support/:id", (req, res) => {
  supports = supports.filter(m => m.id !== req.params.id);

  io.emit("support_update", supports);

  res.json({ success: true });
});

/* =========================
   💬 WhatsApp Chat (Socket.io)
========================= */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // send history
  socket.emit("chat_history", messages);

  // new message
  socket.on("send_message", (data) => {
    const msg = {
      id: Date.now().toString(),
      text: data.text,
      sender: data.sender, // user / admin
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
   Home test
========================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Server is running 🚀"
  });
});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
