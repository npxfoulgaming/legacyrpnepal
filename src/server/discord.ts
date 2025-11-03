import { Router } from "express";
import axios from "axios";
import { db } from "./db"; // adjust path to your DB connection
import type { RowDataPacket } from "mysql2";

const router = Router();

// ------------------ Types ------------------
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

interface ClientInfo {
  ip: string;
  city?: string;
  countryName?: string;
  [key: string]: unknown;
}

interface UserRow extends RowDataPacket {
  discord_id: string;
  username: string;
  global_name: string;
  avatar_url: string | null;
  banner: string | null;
  role_level: number;
  banned: number;
  login_ip: string;
}

// ------------------ Routes ------------------

// 1️⃣ Login
router.get("/login", (_req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI!
  )}&response_type=code&scope=identify%20email%20guilds%20connections`;
  res.redirect(url);
});

// 2️⃣ Callback
router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code provided");

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
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Fetch user data
    const [userRes, guildsRes, connectionsRes] = await Promise.all([
      axios.get<DiscordUser>("https://discord.com/api/users/@me", { headers: { Authorization: `${token_type} ${access_token}` } }),
      axios.get<DiscordGuild[]>("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `${token_type} ${access_token}` } }),
      axios.get<DiscordConnection[]>("https://discord.com/api/users/@me/connections", { headers: { Authorization: `${token_type} ${access_token}` } }),
    ]);

    const user = userRes.data;
    const guilds = guildsRes.data;
    const connections = connectionsRes.data;

    // Avatar & Banner URLs
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${user.avatar.startsWith("a_") ? ".gif" : ".png"}`
      : null;
    const bannerUrl = user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png` : null;

    // Fetch guild member info using Bot Token
    const botToken = process.env.DISCORD_BOT_TOKEN!;
    const guildMembers: GuildMember[] = await Promise.all(
      guilds.map(async (guild) => {
        try {
          const memberRes = await axios.get(`https://discord.com/api/v10/guilds/${guild.id}/members/${user.id}`, {
            headers: { Authorization: `Bot ${botToken}` },
          });
          const member = memberRes.data;
          return {
            guild_id: guild.id,
            roles: member.roles || [],
            joined_at: member.joined_at,
            nickname: member.nick,
            deaf: member.deaf,
            mute: member.mute,
          };
        } catch {
          return { guild_id: guild.id, roles: [], joined_at: "", nickname: null, deaf: false, mute: false };
        }
      })
    );

    // Get user IP
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";

    // Fetch IP info from BigDataCloud
    let loginIpData: ClientInfo = { ip: rawIp };
    try {
      const bigDataRes = await axios.get<ClientInfo>(`https://api.bigdatacloud.net/data/client-info?ip=${rawIp}&localityLanguage=en`);
      loginIpData = bigDataRes.data;
    } catch (err) {
      console.error("BigDataCloud error:", err);
    }

    // Insert/update user in DB
    await db.query(
      `INSERT INTO users 
        (discord_id, username, global_name, avatar_url, banner, access_token, refresh_token, token_type, expires_at, guilds, connections, guild_member, login_ip, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
         username=VALUES(username),
         global_name=VALUES(global_name),
         avatar_url=VALUES(avatar_url),
         banner=VALUES(banner),
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
        avatarUrl,
        bannerUrl,
        access_token,
        refresh_token,
        token_type,
        expiresAt,
        JSON.stringify(guilds),
        JSON.stringify(connections),
        JSON.stringify(guildMembers),
        JSON.stringify(loginIpData),
      ]
    );

    // Set cookie and redirect
    res.cookie("token", access_token, { httpOnly: true, maxAge: expires_in * 1000 });
    res.redirect("/");
  } catch (err) {
    console.error("Discord OAuth error:", err);
    res.status(500).send("OAuth failed");
  }
});

// 3️⃣ Logout
router.get("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// 4️⃣ Get current user
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
