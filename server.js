```js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();

/* =========================
   اتصال MongoDB
========================= */

mongoose.connect(
  "mongodb+srv://admin:123456Aa@cluster0.abcd1.mongodb.net/shop"
);

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connected");
});

/* =========================
   تنظیمات
========================= */

app.use(express.static("public"));
app.use(express.json());

/* =========================
   مدل محصولات
========================= */

const Product = mongoose.model("Product", {
  name: String,
  price: String,
  image: String,
});

/* =========================
   مدل سفارش‌ها
========================= */

const Order = mongoose.model("Order", {
  items: Array,
  total: Number,
  customer: Object,
});

/* =========================
   مدل پشتیبانی
========================= */

const Support = mongoose.model("Support", {
  name: String,
  msg: String,
});

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

    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );

  },
});

const upload = multer({ storage });

/* =========================
   صفحات سایت
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
   افزودن محصول
========================= */

app.post(
  "/add-product",
  upload.single("image"),
  async (req, res) => {

    if (!req.file) {
      return res.json({
        error: "عکس انتخاب نشده"
      });
    }

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: "/uploads/" + req.file.filename,
    });

    await product.save();

    res.json({
      success: true,
    });

  }
);

/* =========================
   گرفتن محصولات
========================= */

app.get("/products", async (req, res) => {

  const products = await Product.find();

  res.json(products);

});

/* =========================
   حذف محصول
========================= */

app.delete("/delete-product/:id", async (req, res) => {

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });

});

/* =========================
   ثبت سفارش
========================= */

app.post("/create-order", async (req, res) => {

  const order = new Order({
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
  });

  await order.save();

  res.json({
    success: true,
  });

});

/* =========================
   گرفتن سفارش‌ها
========================= */

app.get("/orders", async (req, res) => {

  const orders = await Order.find();

  res.json(orders);

});

/* =========================
   حذف سفارش
========================= */

app.delete("/delete-order/:id", async (req, res) => {

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });

});

/* =========================
   ثبت پیام پشتیبانی
========================= */

app.post("/support", async (req, res) => {

  const support = new Support({
    name: req.body.name,
    msg: req.body.msg,
  });

  await support.save();

  res.json({
    success: true,
  });

});

/* =========================
   گرفتن پیام‌ها
========================= */

app.get("/support", async (req, res) => {

  const supports = await Support.find();

  res.json(supports);

});

/* =========================
   حذف پیام پشتیبانی
========================= */

app.delete("/support/:id", async (req, res) => {

  await Support.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });

});

/* =========================
   اجرای سرور
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "🚀 Server running on port " + PORT
  );

});
```

