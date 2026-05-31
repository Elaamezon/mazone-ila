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
   ساخت فایل اگر نبود
========================= */
function initFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ products: [], orders: [] }, null, 2)
    );
  }
}

/* =========================
   لود دیتا (SAFE)
========================= */
function loadData() {
  try {
    initFile();

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);

    products = data.products || [];
    orders = data.orders || [];
  } catch (err) {
    console.log("⚠️ Error loading data, reset applied");
    products = [];
    orders = [];
  }
}

/* =========================
   ذخیره دیتا
========================= */
function saveData() {
  const data = {
    products,
    orders,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

loadData();

/* =========================
   آپلود عکس
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
    image: "/uploads/" + req.file.filename,
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

  products = products.filter((p) => p.id !== id);
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
    status: "در انتظار بررسی",
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

  orders = orders.filter((o) => o.id !== id);
  saveData();

  res.json({ success: true });
});

/* =========================
   🚀 اجرا روی Render
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
  console.log("🚀 Server running on port " + PORT);
});
