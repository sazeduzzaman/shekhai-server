require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Connect database
connectDB();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const lessonRoutes = require("./routes/lessons");
const paymentRoutes = require("./routes/payments");
const uploadRoutes = require("./routes/uploads");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/category");

// Routes
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

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
