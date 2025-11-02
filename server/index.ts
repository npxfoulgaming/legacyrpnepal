import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables (Vercel injects them automatically)
dotenv.config();

// Import routes (use .js when built)
import authRoutes from "./routes/auth.js";
import profileRoute from "./routes/profile.js";
import userRoute from "./routes/user.js";

const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(
  cors({
    origin: "https://legacyrpnepal.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

// --------------------
// Routes
// --------------------
app.use("/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/profile", profileRoute);

// --------------------
// Health Check
// --------------------
app.get("/", (_req, res) => {
  res.send("✅ Legacy RP Nepal Backend is running on Vercel!");
});

// --------------------
// Export Express App
// (⚠️ Do NOT call app.listen() on Vercel)
// --------------------
export default app;
