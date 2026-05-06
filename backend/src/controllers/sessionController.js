import mongoose from "mongoose";
import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    
    // Handle case where user is not available (when protectRoute is removed)
    const userId = req.user?._id || new mongoose.Types.ObjectId(); // Generate valid ObjectId
    const clerkId = req.user?.clerkId || `test_user_${Date.now()}`;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });
    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    // Return all completed sessions (removed user filter for testing)
    const sessions = await Session.find({
      status: "completed"
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }
    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    if (session.participant) return res.status(409).json({ message: "Session is full" });
    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    // If user is authenticated, check if they are the host
    if (req.user && req.user._id) {
      const userId = req.user._id;
      if (session.host && session.host.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Only the host can end the session" });
      }
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Try to delete Stream call and channel, but don't fail if they don't exist
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
    } catch (streamError) {
      console.log("Error deleting Stream call (may not exist):", streamError.message);
    }

    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (channelError) {
      console.log("Error deleting Stream channel (may not exist):", channelError.message);
    }

    session.status = "completed";
    await session.save();
    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}