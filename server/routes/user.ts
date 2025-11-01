import express from "express";
import pool from "../db.ts";
import type { RowDataPacket } from "mysql2"; // type-only import

const router = express.Router();

// Define the row type and use it for the query result
interface UserRow extends RowDataPacket {
  discord_id: string;
  username: string;
  avatar_url: string | null;
}

router.get("/", async (req, res) => {
  const access_token = req.query.access_token as string;
  if (!access_token) return res.status(401).json({ error: "No access token" });

  try {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT discord_id, username, avatar_url FROM users WHERE access_token = ?",
      [access_token]
    );

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    const fullAvatarUrl = user.avatar_url
      ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar_url}.png`
      : undefined;

    return res.json({ user: { username: user.username, avatar_url: fullAvatarUrl } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

export default router;
