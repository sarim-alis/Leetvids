// Imports.
import express from "express";
import dotenv from "dotenv";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/lib.js";
import cors from "cors";
dotenv.config();

// App.
const app = express();

// Middlware.
app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));


// Routes.
app.get("/", (req, res) => { res.status(200).json({ message: "Server health is good. 🔋" });})

// Server.
app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT} 🍭🌟🚀`)); connectDb()