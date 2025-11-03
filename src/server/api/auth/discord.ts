import express from "express";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import discordRouter from "../../../server/discord";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth/discord", discordRouter);

export default serverless(app);
