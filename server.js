const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.json());

/* =========================
   دیتابیس
========================= */
const DATA_FILE = "./data.json";

let products = [];
let orders = [];
let supports = [];

/* =========================
   ساخت فایل اولیه
========================= */
function initFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ products: [], orders: [], supports: [] }, null, 2)
    );
  }
}

/* =========================
   لود دیتا
========================= */
function loadData() {
  try {
    initFile();

    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

    products = data.products || [];
    orders = data.orders || [];
    supports = data.supports || [];
  } catch (err) {
    console.log("⚠️ DB reset");
    products = [];
    orders = [];
    supports = [];
  }
}

/* =========================
   ذخیره دیتا
========================= */
function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ products, orders, supports }, null, 2)
  );
}

loadData();

/* =========================
   آپلود فایل
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
   محصولات
========================= */
app.post("/add-product", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.json({ error: "no image" });
  }

  const product = {
    id: Date.now(),
    name: req.body.name || "",
    price: req.body.price || 0,
    image: "/uploads/" + req.file.filename,
  };

  products.push(product);
  saveData();

  res.json({ success: true });
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.delete("/delete-product/:id", (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  saveData();
  res.json({ success: true });
});

/* =========================
   سفارش‌ها
========================= */
app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now(),
    items: req.body.items || [],
    total: req.body.total || 0,
    customer: req.body.customer || {},
  };

  orders.push(order);
  saveData();

  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.delete("/delete-order/:id", (req, res) => {
  const id = Number(req.params.id);
  orders = orders.filter(o => o.id !== id);
  saveData();
  res.json({ success: true });
});

/* =========================
   پشتیبانی
========================= */
app.post("/support", (req, res) => {
  const msg = {
    id: Date.now(),
    name: req.body.name || "ناشناس",
    msg: req.body.msg || "",
  };

  supports.push(msg);
  saveData();

  res.json({ success: true });
});

app.get("/support", (req, res) => {
  res.json(supports);
});

/* =========================
   صفحات
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
   اجرا
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on " + PORT);
});
