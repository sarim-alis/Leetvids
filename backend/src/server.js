// Imports.
import express from "express";
import dotenv from "dotenv";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/lib.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import clerkRoutes from "./routes/clerk.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
dotenv.config();

// App.
const app = express();

// Middlware.
app.use(express.json());
app.use(cors({origin:"*", credentials: false}));
app.use(clerkMiddleware());


// Routes.
// app.get("/", (req, res) => { res.status(200).json({ message: "Server health is good. 🔋" });})
app.use("/api/clerk", clerkRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// Server.
app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT} 🍭🌟🚀`)); connectDb()