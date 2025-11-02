import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.ts";
import profileRoute from "./routes/profile.ts";
import userRoute from "./routes/user.ts";

const app = express();

app.use("/api/user", userRoute);
// Middleware
app.use(express.json());
app.use(cors({ origin: "https://legacyrpnepal.vercel.app", credentials: true }));
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/", (_req, res) => res.send("Backend is running!"));

// Api
app.use("/api/user", userRoute);
app.use("/api/profile", profileRoute);

// Debug env vars
console.log("DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID);
console.log("DISCORD_REDIRECT_URI:", process.env.DISCORD_REDIRECT_URI);


// Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Server running on https://legacyrpnepal.vercel.app`));
