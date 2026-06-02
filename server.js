<<<<<<< HEAD
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

/* =========================
   تنظیمات پایه
========================= */
app.use(express.static("public"));
app.use(express.json());

/* =========================
   فایل دیتابیس
========================= */
const DATA_FILE = "./data.json";

let products = [];
let orders = [];

/* =========================
   لود اطلاعات از فایل
========================= */
function loadData(){

  if(fs.existsSync(DATA_FILE)){
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    products = data.products || [];
    orders = data.orders || [];
  }

}

/* =========================
   ذخیره اطلاعات در فایل
========================= */
function saveData(){

  const data = {
    products,
    orders
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

}

loadData();

/* =========================
   آپلود عکس
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =========================
   ➕ افزودن محصول
========================= */
app.post("/add-product", upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.json({ error: "عکس ارسال نشده" });
  }

  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    image: "/uploads/" + req.file.filename
  };

  products.push(product);

  saveData();

  res.json({ success: true });

});

/* =========================
   📦 گرفتن محصولات
========================= */
app.get("/products", (req, res) => {
  res.json(products);
});

/* =========================
   ❌ حذف محصول
========================= */
app.delete("/delete-product/:id", (req, res) => {

  const id = Number(req.params.id);

  products = products.filter(p => p.id !== id);

  saveData();

  res.json({ success: true });

});

/* =========================
   🧾 ثبت سفارش
========================= */
app.post("/create-order", (req, res) => {

  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
    status: "در انتظار بررسی"
  };

  orders.push(order);

  saveData();

  res.json({ success: true });

});

/* =========================
   📦 گرفتن سفارش‌ها
========================= */
app.get("/orders", (req, res) => {
  res.json(orders);
});

/* =========================
   ❌ حذف سفارش
========================= */
app.delete("/delete-order/:id", (req, res) => {

  const id = Number(req.params.id);

  orders = orders.filter(o => o.id !== id);

  saveData();

  res.json({ success: true });

});

/* =========================
   🚀 اجرا
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
=======
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* =========================
   Middleware
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   Upload setup
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   دیتابیس ساده
========================= */

let products = [];
let orders = [];
let supports = [];

/* =========================
   محصولات (UPLOAD)
========================= */

app.post("/add-product", upload.single("image"), (req, res) => {
  const product = {
    id: Date.now().toString(),
    name: req.body.name,
    price: Number(req.body.price),
    image: req.file ? "/uploads/" + req.file.filename : ""
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
    total: Number(req.body.total || 0),
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
   پشتیبانی
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
   Socket Chat (اختیاری)
========================= */

let messages = [];

io.on("connection", (socket) => {
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
});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("🚀 Server running on " + PORT);
});

>>>>>>> b881b0db09f6930f1e8ba070b674a5764f1a4fc8
