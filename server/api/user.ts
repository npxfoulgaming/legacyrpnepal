// server/api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import pool from "../db";
import type { RowDataPacket } from "mysql2/promise";

interface StoredDiscordUser extends RowDataPacket {
  id: number;
  discord_id: string;
  username: string;
  avatar_url: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const accessToken = (req.headers["x-access-token"] || req.query.access_token) as string;
  if (!accessToken) return res.status(400).json({ error: "access_token required" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT discord_id, username, avatar_url FROM users WHERE access_token = ?",
      [accessToken]
    );

    const users = rows as StoredDiscordUser[];
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const fullAvatarUrl = user.avatar_url
      ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar_url}.png`
      : null;

    return res.status(200).json({ user: { username: user.username, avatar_url: fullAvatarUrl } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}
