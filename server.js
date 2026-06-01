```javascript
const express = require("express");
const path = require("path");

const app = express();

/* =========================
   تنظیمات
========================= */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* =========================
   دیتابیس موقت
========================= */

let products = [];
let orders = [];
let supports = [];

/* =========================
   صفحات
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* =========================
   محصولات
========================= */

app.post("/add-product", (req, res) => {

  try {

    if (!req.body.name || !req.body.price) {

      return res.json({
        success: false,
        message: "اطلاعات ناقص"
      });

    }

    const product = {

      id: Date.now().toString(),

      name: req.body.name,

      price: Number(req.body.price),

      image:
        req.body.image ||
        "https://via.placeholder.com/300"

    };

    products.push(product);

    res.json({
      success: true,
      product
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

/* گرفتن محصولات */

app.get("/products", (req, res) => {

  res.json(products);

});

/* حذف محصول */

app.delete("/delete-product/:id", (req, res) => {

  products = products.filter(
    p => p.id !== req.params.id
  );

  res.json({
    success: true
  });

});

/* =========================
   سفارش‌ها
========================= */

/* ثبت سفارش */

app.post("/create-order", (req, res) => {

  try {

    const order = {

      id: Date.now().toString(),

      items: req.body.items || [],

      total: Number(req.body.total || 0),

      customer: req.body.customer || {},

      status: "pending",

      createdAt: new Date()

    };

    orders.push(order);

    res.json({
      success: true,
      order
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

/* گرفتن سفارش‌ها */

app.get("/orders", (req, res) => {

  res.json(orders);

});

/* حذف سفارش */

app.delete("/delete-order/:id", (req, res) => {

  orders = orders.filter(
    o => o.id !== req.params.id
  );

  res.json({
    success: true
  });

});

/* =========================
   پشتیبانی
========================= */

/* ارسال پیام */

app.post("/support", (req, res) => {

  try {

    if (!req.body.name || !req.body.msg) {

      return res.json({
        success: false,
        message: "اطلاعات ناقص"
      });

    }

    const msg = {

      id: Date.now().toString(),

      name: req.body.name,

      msg: req.body.msg,

      reply: "",

      createdAt: new Date()

    };

    supports.push(msg);

    res.json({
      success: true,
      msg
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

/* گرفتن پیام‌ها */

app.get("/support", (req, res) => {

  res.json(supports);

});

/* پاسخ ادمین */

app.post("/support/reply/:id", (req, res) => {

  try {

    const msg = supports.find(
      s => s.id === req.params.id
    );

    if (!msg) {

      return res.json({
        success: false,
        message: "پیام پیدا نشد"
      });

    }

    msg.reply = req.body.reply;

    res.json({
      success: true
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

/* حذف پیام */

app.delete("/support/:id", (req, res) => {

  supports = supports.filter(
    s => s.id !== req.params.id
  );

  res.json({
    success: true
  });

});

/* =========================
   تست
========================= */

app.get("/api", (req, res) => {

  res.json({
    success: true,
    message: "Server is working 🚀"
  });

});

/* =========================
   اجرای سرور
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(
    "🚀 Server running on " + PORT
  );

});
```
