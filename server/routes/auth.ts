import express from "express";
import axios from "axios";
import pool from "../db.ts"; // MySQL pool
import type { Request, Response } from "express";

const router = express.Router();

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  discriminator: string;
  email: string | null;
  verified: boolean;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  locale: string | null;
  mfa_enabled: boolean;
  flags: number | null;
  public_flags: number | null;
  premium_type: number | null;
  bot?: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

interface DiscordConnection {
  id: string;
  name: string;
  type: string;
  revoked: boolean;
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  visibility: number;
}

interface DiscordGuildMember {
  user: DiscordUser;
  nick: string | null;
  roles: string[];
  joined_at: string;
  premium_since: string | null;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}


function isAxiosError(error: unknown): error is { response?: { data?: unknown }; message: string } {
  return typeof error === "object" && error !== null && "message" in error;
}

// Discord login redirect
router.get("/discord/login", (_req: Request, res: Response) => {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) return res.status(500).send("Discord environment variables not set");

  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify email guilds connections guilds.members.read`;

  res.redirect(url);
});

// Discord OAuth callback
router.get("/discord/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code provided");

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;

  try {
    // Exchange code for token
    const tokenRes = await axios.post<DiscordTokenResponse>(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in, token_type } = tokenRes.data;

    // Get user info
    const userRes = await axios.get<DiscordUser>("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userRes.data;

    // Get guilds
    const guildsRes = await axios.get<DiscordGuild[]>("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const guilds = guildsRes.data;

    // Get connections
    const connectionsRes = await axios.get<DiscordConnection[]>("https://discord.com/api/users/@me/connections", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const connections = connectionsRes.data;

    // Optional: get guild member info for first guild
let guildMember: DiscordGuildMember | null = null;

if (guilds.length > 0) {
  try {
    const memberRes = await axios.get<DiscordGuildMember>(
      `https://discord.com/api/users/@me/guilds/${guilds[0].id}/member`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    guildMember = memberRes.data;
  } catch (err) {
    console.warn("Failed to fetch guild member info:", err);
  }
}

console.log("Member info:", guildMember);


    // Insert or update user with JSON columns
    await pool.query(
      `
      INSERT INTO users (
        discord_id, username, global_name, discriminator, email, verified,
        avatar_url, banner, accent_color, locale, mfa_enabled, flags,
        public_flags, premium_type, bot,
        access_token, refresh_token, token_type, expires_at,
        guilds, connections, guild_member
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username=VALUES(username),
        global_name=VALUES(global_name),
        discriminator=VALUES(discriminator),
        email=VALUES(email),
        verified=VALUES(verified),
        avatar_url=VALUES(avatar_url),
        banner=VALUES(banner),
        accent_color=VALUES(accent_color),
        locale=VALUES(locale),
        mfa_enabled=VALUES(mfa_enabled),
        flags=VALUES(flags),
        public_flags=VALUES(public_flags),
        premium_type=VALUES(premium_type),
        bot=VALUES(bot),
        access_token=VALUES(access_token),
        refresh_token=VALUES(refresh_token),
        token_type=VALUES(token_type),
        expires_at=VALUES(expires_at),
        guilds=VALUES(guilds),
        connections=VALUES(connections),
        guild_member=VALUES(guild_member),
        updated_at=NOW()
      `,
      [
        user.id, user.username, user.global_name, user.discriminator, user.email, user.verified,
        user.avatar, user.banner, user.accent_color, user.locale, user.mfa_enabled, user.flags,
        user.public_flags, user.premium_type, user.bot ? 1 : 0,
        access_token, refresh_token, token_type, expires_in,
        JSON.stringify(guilds), JSON.stringify(connections), JSON.stringify(guildMember)
      ]
    );

    console.log("Guild member info:", guildMember);

    res.redirect("https://legacyrpnepal.vercel.app"); // frontend
  } catch (err: unknown) {
    if (isAxiosError(err)) console.error("Axios error:", err.response?.data ?? err.message);
    else if (err instanceof Error) console.error("Error:", err.message);
    else console.error("Unknown error", err);
    res.status(500).send("Error logging in with Discord");
  }
});

export default router;
