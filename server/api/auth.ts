// server/api/auth.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import pool from "../db";
import dotenv from "dotenv";

dotenv.config();

// Discord OAuth interfaces
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    if (method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    switch (query.action) {
      case "login":
        return loginWithDiscord(res);
      case "callback":
        return handleDiscordCallback(req, res);
      default:
        return res.status(400).send("Invalid action");
    }
  } catch (error) {
    console.error("Unexpected error in handler:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Redirect to Discord OAuth URL
async function loginWithDiscord(res: VercelResponse) {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).send("Discord environment variables not set");
  }

  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify email guilds connections guilds.members.read`;

  return res.redirect(url);
}

// Handle callback and store user data
async function handleDiscordCallback(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code parameter");

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    // Get access token
    const tokenResponse = await axios.post<DiscordTokenResponse>(
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

    const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;

    // Fetch data from Discord
    const user = await fetchDiscordUser(access_token);
    const guilds = await fetchDiscordGuilds(access_token);
    const connections = await fetchDiscordConnections(access_token);
    const guildMember = await fetchGuildMember(access_token, guilds);

    // Save/update user in MySQL
    await saveUserToDatabase({
      user,
      access_token,
      refresh_token,
      expires_in,
      token_type,
      guilds,
      connections,
      guildMember,
    });

    return res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return res.status(500).send("OAuth failed");
  }
}

// -------------
// Helpers
// -------------
async function fetchDiscordUser(accessToken: string) {
  const res = await axios.get<DiscordUser>("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

async function fetchDiscordGuilds(accessToken: string) {
  const res = await axios.get<DiscordGuild[]>("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

async function fetchDiscordConnections(accessToken: string) {
  const res = await axios.get<DiscordConnection[]>("https://discord.com/api/users/@me/connections", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

async function fetchGuildMember(accessToken: string, guilds: DiscordGuild[]) {
  if (!guilds.length) return null;
  try {
    const res = await axios.get<DiscordGuildMember>(
      `https://discord.com/api/users/@me/guilds/${guilds[0].id}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.data;
  } catch (error) {
    console.warn("Could not retrieve guild member info:", error);
    return null;
  }
}

async function saveUserToDatabase({
  user,
  access_token,
  refresh_token,
  expires_in,
  token_type,
  guilds,
  connections,
  guildMember,
}: {
  user: DiscordUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  guilds: DiscordGuild[];
  connections: DiscordConnection[];
  guildMember: DiscordGuildMember | null;
}) {
  return pool.query(
    `
    INSERT INTO users (
      discord_id, username, global_name, discriminator, email, verified,
      avatar_url, banner, accent_color, locale, mfa_enabled,
      flags, public_flags, premium_type, bot,
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
      user.id,
      user.username,
      user.global_name,
      user.discriminator,
      user.email,
      user.verified,
      user.avatar,
      user.banner,
      user.accent_color,
      user.locale,
      user.mfa_enabled,
      user.flags,
      user.public_flags,
      user.premium_type,
      user.bot ? 1 : 0,
      access_token,
      refresh_token,
      token_type,
      expires_in,
      JSON.stringify(guilds),
      JSON.stringify(connections),
      JSON.stringify(guildMember),
    ]
  );
}
