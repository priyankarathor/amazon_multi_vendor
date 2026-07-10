const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  let rawBody = '';
  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', () => {
    if (!rawBody || !rawBody.trim()) {
      req.body = {};
      return next();
    }

    const trimmed = rawBody.trim();
    let parsedBody;

    try {
      parsedBody = JSON.parse(trimmed);
    } catch (error) {
      try {
        parsedBody = JSON.parse(trimmed.replace(/^"|"$/g, ''));
      } catch (innerError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON body',
          detail: 'Please send a valid JSON object body'
        });
      }
    }

    req.body = parsedBody;
    next();
  });

  req.on('error', () => {
    return res.status(400).json({
      success: false,
      message: 'Unable to read request body'
    });
  });
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/users", require("./routes/venderRoutes"));
app.use("/api/endusers", require("./routes/EnduserRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subcategories", require("./routes/subCategoryRoutes"));
app.use("/api/subtosubcategories", require("./routes/subToSubCategoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categoryattribute", require("./routes/categoryAttributeRoutes"));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/admin/banners', require('./routes/admin/bannerRoutes'));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishrlist", require("./routes/wishlistRoutes"));
app.use("/api/orders",require("./routes/orderRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});