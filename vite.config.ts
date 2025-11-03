import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import express from "express";
import cookieParser from "cookie-parser";
import discordRoutes from "./src/server/discord";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Node <18

dotenv.config();

// Discord API types
interface DiscordEvent {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  status?: number;
  entity_metadata?: { location?: string };
  image?: string;
  creator?: { username: string; avatar?: string | null };
}

interface DiscordEventUserResponse {
  guild_scheduled_event_id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
    discriminator: string;
    global_name?: string | null;
  };
  response: number;
}

// Extend DiscordEvent with user_responses for API output
interface DiscordEventWithUsers extends DiscordEvent {
  user_responses: DiscordEventUserResponse[];
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "express-middleware",
      configureServer(server: ViteDevServer) {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Discord OAuth routes
        app.use("/api/auth/discord", discordRoutes);

        // Route: Fetch Discord events + interested users
        app.get("/api/discord-events", async (_req, res) => {
          try {
            // Fetch all scheduled events
            const eventsResponse = await fetch(
              `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/scheduled-events`,
              {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!eventsResponse.ok) {
              const text = await eventsResponse.text();
              return res.status(eventsResponse.status).send(text);
            }

            const eventsData: DiscordEvent[] = (await eventsResponse.json()) as DiscordEvent[];

            // Fetch interested users for each event
            const eventsWithUsers: DiscordEventWithUsers[] = await Promise.all(
              eventsData.map(async (event) => {
                try {
                  const usersResponse = await fetch(
                    `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/scheduled-events/${event.id}/users`,
                    {
                      headers: {
                        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  let user_responses: DiscordEventUserResponse[] = [];
                  if (usersResponse.ok) {
                    user_responses = (await usersResponse.json()) as DiscordEventUserResponse[];
                  }

                  return {
                    ...event,
                    user_responses,
                  };
                } catch (err) {
                  console.error(`Failed to fetch users for event ${event.id}:`, err);
                  return { ...event, user_responses: [] };
                }
              })
            );

            res.json(eventsWithUsers);
          } catch (err) {
            console.error("Failed to fetch Discord events:", err);
            res.status(500).json({ error: "Internal server error" });
          }
        });

        server.middlewares.use(app);
      },
    },
  ],
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] || ""}/`
    : "/",
});
