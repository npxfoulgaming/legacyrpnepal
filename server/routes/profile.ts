// routes/user.ts
import express from "express";
import type { Request, Response } from "express";
import pool from "../db.ts";
import type { RowDataPacket } from "mysql2/promise";

const router = express.Router();

// TypeScript interface for the user data
interface StoredDiscordUser extends RowDataPacket {
  id: number;
  discord_id: string;
  username: string;
  global_name: string | null;
  discriminator: string;
  email: string | null;
  verified: boolean;
  avatar_url: string | null;
  banner: string | null;
  accent_color: number | null;
  locale: string | null;
  mfa_enabled: boolean;
  flags: number | null;
  public_flags: number | null;
  premium_type: number | null;
  bot: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: Date;
  guilds: string;
  connections: string;
  guild_member: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /api/user
 * Get all Discord data for a user by access_token
 */
router.get("/", async (req: Request, res: Response) => {
  const accessToken = req.headers["x-access-token"] || req.query.access_token;

  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ error: "access_token is required" });
  }

  try {
    const [rows] = await pool.query<StoredDiscordUser[]>(
      "SELECT * FROM users WHERE access_token = ?",
      [accessToken]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid access token" });

    // Parse JSON columns before sending
    const response = {
      ...user,
      guilds: JSON.parse(user.guilds),
      connections: JSON.parse(user.connections),
      guild_member: user.guild_member ? JSON.parse(user.guild_member) : null,
    };

    res.json({ user: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
