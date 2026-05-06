import express from "express";
import { createSession, endSession, getActiveSessions, getMyRecentSessions, getSessionById, joinSession } from "../controllers/sessionController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.post("/", createSession);
router.get("/active", getActiveSessions); // Temporarily removed protectRoute
router.get("/my-recent", getMyRecentSessions); // Temporarily removed protectRoute
router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", endSession); // Temporarily removed protectRoute

export default router;