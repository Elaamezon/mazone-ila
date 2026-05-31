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

/* 🔥 SAFE LOAD */
function loadData(){
  try {
    if(fs.existsSync(DATA_FILE)){
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw || "{}");

      products = data.products || [];
      orders = data.orders || [];
    }
  } catch (err) {
    console.log("Data file error fixed automatically");
    products = [];
    orders = [];
  }
}

/* SAVE */
function saveData(){
  const data = { products, orders };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

loadData();

/* upload folder safe */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* PRODUCTS */
app.post("/add-product", upload.single("image"), (req, res) => {
  if (!req.file) return res.json({ error: "no image" });

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

app.get("/products", (req, res) => {
  res.json(products);
});

app.delete("/delete-product/:id", (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  saveData();
  res.json({ success: true });
});

/* ORDERS */
app.post("/create-order", (req, res) => {
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
    customer: req.body.customer,
    status: "pending"
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

/* PORT FIX */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
