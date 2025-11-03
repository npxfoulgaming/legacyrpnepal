import { Router } from "express";
import axios from "axios";
import { db } from "./db";
import type { RowDataPacket } from "mysql2";

const router = Router();

// TypeScript interfaces
interface DiscordUser {
  id: string;
  username: string;
  global_name: string;
  discriminator: string;
  email: string;
  verified: boolean;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  locale: string;
  mfa_enabled: boolean;
  flags: number;
  public_flags: number;
  premium_type: number;
  bot: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface DiscordConnection {
  id: string;
  name: string;
  type: string;
  revoked: boolean;
  integrations: unknown[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
}

interface GuildMember {
  guild_id: string;
  roles: string[];
  joined_at: string;
  nickname: string | null;
  deaf: boolean;
  mute: boolean;
}

interface UserRow extends RowDataPacket {
  id: number;
  discord_id: string;
  username: string;
  global_name: string;
  discriminator: string;
  email: string;
  verified: number;
  avatar_url: string | null;
  banner: string | null;
  accent_color: number | null;
  locale: string;
  mfa_enabled: number;
  flags: number;
  public_flags: number;
  premium_type: number;
  bot: number;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: Date;
  guilds: string;
  connections: string;
  guild_member: string;
  login_ip: string;
  role_level: number;
  banned: number;
  last_login: Date;
}

// 1. Discord login
router.get("/login", (_req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI!
  )}&response_type=code&scope=identify%20email%20guilds%20connections`;
  res.redirect(url);
});

// 2. Discord callback
router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code");

  try {
    // Exchange code for token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, token_type, expires_in } = tokenRes.data;

    // Fetch Discord user, guilds, connections
    const [userRes, guildsRes, connectionsRes] = await Promise.all([
      axios.get<DiscordUser>("https://discord.com/api/users/@me", {
        headers: { Authorization: `${token_type} ${access_token}` },
      }),
      axios.get<DiscordGuild[]>("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `${token_type} ${access_token}` },
      }),
      axios.get<DiscordConnection[]>("https://discord.com/api/users/@me/connections", {
        headers: { Authorization: `${token_type} ${access_token}` },
      }),
    ]);

    const user = userRes.data;
    const guilds = guildsRes.data;
    const connections = connectionsRes.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Avatar & banner URLs
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${user.avatar.startsWith("a_") ? ".gif" : ".png"}`
      : null;
    const bannerUrl = user.banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png`
      : null;

    // Serverless-safe: skip fetching guild member details
    const guildMembers: GuildMember[] = guilds.map(guild => ({
      guild_id: guild.id,
      roles: [],
      joined_at: "",
      nickname: null,
      deaf: false,
      mute: false,
    }));

    // Detect IP (Vercel-compatible)
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "0.0.0.0";

    // Optional: fetch client info
    let loginIp = { ip };
    try {
      const bigDataRes = await axios.get(`https://api.bigdatacloud.net/data/client-info?ip=${ip}&localityLanguage=en`);
      loginIp = bigDataRes.data;
    } catch (e) {
      console.warn("BigDataCloud failed, fallback to IP only.");
    }

    // Insert/update user
    await db.query(
      `INSERT INTO users (
        discord_id, username, global_name, discriminator, email, verified, avatar_url, banner, accent_color, locale, mfa_enabled,
        flags, public_flags, premium_type, bot, access_token, refresh_token, token_type, expires_at, guilds, connections, guild_member, login_ip, last_login
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        login_ip=VALUES(login_ip),
        last_login=CURRENT_TIMESTAMP`,
      [
        user.id,
        user.username,
        user.global_name,
        user.discriminator,
        user.email,
        user.verified ? 1 : 0,
        avatarUrl,
        bannerUrl,
        user.accent_color,
        user.locale,
        user.mfa_enabled ? 1 : 0,
        user.flags,
        user.public_flags,
        user.premium_type,
        user.bot ? 1 : 0,
        access_token,
        refresh_token,
        token_type,
        expiresAt,
        JSON.stringify(guilds),
        JSON.stringify(connections),
        JSON.stringify(guildMembers),
        JSON.stringify(loginIp),
      ]
    );

    // Secure cookie for Vercel
    res.cookie("token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in * 1000,
    });

    res.redirect("https://legacyrpnepal.vercel.app/");
  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).send("OAuth failed");
  }
});

// Logout
router.get("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Get current user
router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json(null);

  try {
    const [rows] = await db.query<UserRow[]>(
      "SELECT discord_id, username, global_name, avatar_url, banner, role_level, banned, login_ip FROM users WHERE access_token = ?",
      [token]
    );
    res.json(rows.length ? rows[0] : null);
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json(null);
  }
});

export default router;
