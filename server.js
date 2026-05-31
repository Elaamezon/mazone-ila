const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.json());

const DATA_FILE = "./data.json";

let products = [];
let orders = [];
let supports = []; // ⭐ پیام‌های پشتیبانی

// ساخت فایل
function initFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ products: [], orders: [], supports: [] }, null, 2)
    );
  }
}

// لود دیتا
function loadData() {
  try {
    initFile();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

    products = data.products || [];
    orders = data.orders || [];
    supports = data.supports || [];
  } catch (e) {
    products = [];
    orders = [];
    supports = [];
  }
}

// ذخیره دیتا
function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ products, orders, supports }, null, 2)
  );
}

loadData();

// آپلود عکس
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   محصولات
========================= */
app.post("/add-product", upload.single("image"), (req, res) => {
  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    image: "/uploads/" + req.file.filename,
  };

  products.push(product);
  saveData();

  res.json({ success: true });
});

app.get("/products", (req, res) => {
  res.json(products);
});

/* =========================
   سفارش‌ها
========================= */
app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
  };

  orders.push(order);
  saveData();

  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

/* =========================
   ⭐ پشتیبانی
========================= */
app.post("/support", (req, res) => {
  const msg = {
    id: Date.now(),
    name: req.body.name,
    msg: req.body.msg,
  };

  supports.push(msg);
  saveData();

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

/* =========================
   اجرا
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
