const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/endusers", require("./routes/EnduserRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subcategories", require("./routes/subCategoryRoutes"));
app.use("/api/subtosubcategories", require("./routes/subToSubCategoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categoryattribute", require("./routes/categoryAttributeRoutes"));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/admin/banners', require('./routes/admin/bannerRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});