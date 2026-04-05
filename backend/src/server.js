// Imports.
import express from "express";
import dotenv from "dotenv";
import { ENV } from "./lib/env.js";
dotenv.config();

// App.
const app = express();

// Routes.
app.get("/", (req, res) => { res.status(200).json({ message: "Server health is good. 🔋" });})

// Server.
app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT} 🍭🌟🚀`))