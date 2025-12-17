require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ---------------------------
// 1️⃣ CORS for frontend + static files
// ---------------------------
// Allow your frontend apps to access the API and static uploads
const allowedOrigins = [
  "http://localhost:5173",                 // React dev server
  "https://shekhai-dashboard.vercel.app", // Production frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ---------------------------
// 2️⃣ Serve static uploads
// ---------------------------
// Users: /uploads/users/...
// Courses: /uploads/courses/...
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------------------------
// 3️⃣ Helmet with CSP
// ---------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://shekhai-server.up.railway.app",
          "http://localhost:5173",
          "https://shekhai-dashboard.vercel.app"
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
      },
    },
  })
);

// ---------------------------
// 4️⃣ Other middleware
// ---------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ---------------------------
// 5️⃣ Connect database
// ---------------------------
connectDB();

// ---------------------------
// 6️⃣ Import routes
// ---------------------------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const lessonRoutes = require("./routes/lessons");
const paymentRoutes = require("./routes/payments");
const uploadRoutes = require("./routes/uploads");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/category");

// ---------------------------
// 7️⃣ Routes
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
// 8️⃣ Error handling middleware
// ---------------------------
app.use(errorHandler);

// ---------------------------
// 9️⃣ Start server
// ---------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
