body{
  margin:0;
  font-family:tahoma;
  background:#f5f6fa;
}

/* هدر */
.topbar{
  background:white;
  padding:15px 20px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
  position:sticky;
  top:0;
}

/* محصولات */
#products{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
  gap:20px;
  padding:20px;
}

/* کارت محصول */
.card{
  background:white;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 5px 15px rgba(0,0,0,0.08);
  transition:0.3s;
}

.card:hover{
  transform:translateY(-5px);
}

.card img{
  width:100%;
  height:240px;
  object-fit:cover;
}

.info{
  padding:15px;
}

.price{
  color:#e74c3c;
  font-weight:bold;
  font-size:18px;
}

/* دکمه */
button{
  background:linear-gradient(135deg,#ff4d4d,#e60000);
  color:white;
  border:none;
  padding:12px;
  width:100%;
  cursor:pointer;
  border-radius:12px;
  font-weight:bold;
  transition:0.3s;
}

button:hover{
  opacity:0.85;
}

/* سبد خرید */
#cartBox{
  position:fixed;
  top:0;
  right:-400px;
  width:350px;
  height:100%;
  background:#111;
  color:white;
  padding:20px;
  transition:0.4s;
  overflow:auto;
}

#cartBox.active{
  right:0;
}

.cartItem{
  display:flex;
  gap:10px;
  padding:10px 0;
  border-bottom:1px solid #333;
}

.cartItem img{
  width:60px;
  height:60px;
  border-radius:10px;
}

input{
  width:100%;
  padding:10px;
  margin:5px 0;
  border-radius:10px;
  border:none;
}
