import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import express from "express";
import cookieParser from "cookie-parser";
import discordRoutes from "./src/server/discord";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: "express-middleware",
      configureServer(server: ViteDevServer) {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use("/api/auth/discord", discordRoutes);

        // Use Express as middleware inside Vite
        server.middlewares.use(app);
      },
    },
  ],
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] || ""}/`
    : "/",
});
