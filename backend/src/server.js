// Imports.
import express from "express";
import dotenv from "dotenv";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/lib.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import clerkRoutes from "./routes/clerk.js";
import testRoutes from "./routes/test.js";
dotenv.config();

// App.
const app = express();

// Middlware.
app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));
app.use(cors({origin:"https://leetvids.vercel.app", credentials: true}));
app.use(clerkMiddleware());


// Routes.
app.get("/", (req, res) => { res.status(200).json({ message: "Server health is good. 🔋" });})
app.use("/api/inngest", serve({client: inngest, functions}));
app.use("/api/clerk", clerkRoutes);
app.use("/api/test", testRoutes);
console.log("[SERVER] Clerk webhook endpoint: /api/clerk/webhook");
console.log("[SERVER] Test webhook endpoint: /api/test/webhook");

// Server.
app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT} 🍭🌟🚀`)); connectDb()