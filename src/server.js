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
// CORS Configuration
// ---------------------------
const allowedOrigins = [
  "http://localhost:5173", 
  "https://shekhai-dashboard.vercel.app",
  "https://shekhai-server.up.railway.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ---------------------------
// Helmet + CSP Configuration
// ---------------------------
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
          "http://localhost:5173",
          "https://shekhai-dashboard.vercel.app",
          "https://shekhai-server.up.railway.app",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "https://shekhai-dashboard.vercel.app",
          "https://shekhai-server.up.railway.app",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" } // Important for images
  })
);

// ---------------------------
// Static Files with CORS Headers
// ---------------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Custom static middleware for uploads with CORS headers
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://shekhai-dashboard.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  express.static(uploadsDir)(req, res, next);
});

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