import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.route.js";
import connectDB from "./lib/db.js";

import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: [
      "http://192.168.1.70:5173",
      "http://localhost:5173",
      "http://192.168.1.70:3000",
      "http://localhost:3000",
      "http://100.64.216.104:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`App listening on port ${process.env.PORT}`);
});

connectDB();

export default app;
