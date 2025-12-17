require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const lessonRoutes = require("./routes/lessons");
const paymentRoutes = require("./routes/payments");
const uploadRoutes = require("./routes/uploads");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/category");

const app = express();

// ---------------------------
// Middleware
// ---------------------------

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", // local frontend
    "https://shekhai-dashboard.vercel.app", // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Helmet + CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5173", // allow local dev
          "https://shekhai-dashboard.vercel.app", // allow deployed frontend
          "https://shekhai-server.up.railway.app" // allow own server
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://shekhai-server.up.railway.app",
          "http://localhost:5173",
          "https://shekhai-dashboard.vercel.app"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
      },
    },
  })
);


// ---------------------------
// Ensure uploads folder exists
// ---------------------------
const uploadsDir = path.join(process.cwd(), "uploads"); // root/uploads
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve static uploads folder
app.use("/uploads", express.static(uploadsDir));

// ---------------------------
// Connect database
// ---------------------------
connectDB();

// ---------------------------
// Routes
// ---------------------------
app.get("/", (req, res) =>
  res.json({ ok: true, message: "Shekhai backend running" })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/categories", categoryRoutes);

// ---------------------------
// Error handling middleware
// ---------------------------
app.use(errorHandler);

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
