import express from "express";
import http from "http";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.route.js";
import jobRouter from "./routes/job.route.js";
import offerRouter from "./routes/offer.route.js";
import messageRouter from "./routes/message.route.js";
import reviewRouter from "./routes/review.route.js";
import aiRouter from "./routes/ai.route.js";
import adminRouter from "./routes/admin.route.js";
import disputeRouter from "./routes/dispute.route.js";
import connectDB from "./lib/db.js";
import { initSocket } from "./lib/socket.js";

import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// app.use(
//   cors({
//     origin: [
//       "http://192.168.1.70:5173",
//       "http://localhost:5173",
//       "http://192.168.1.70:3005",
//       "http://localhost:3005",
//       "http://100.64.234.28:5173",
//       "http://192.168.1.66:3005",
//       "http://localhost:8081",
//       "http://172.16.17.90:8081"
//     ],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/job", jobRouter);
app.use("/api/offer", offerRouter);
app.use("/api/messages", messageRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/ai", aiRouter);
app.use("/api/admin", adminRouter);
app.use("/api/disputes", disputeRouter);

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`App listening on port ${process.env.PORT}`);
});

connectDB();

export default app;
