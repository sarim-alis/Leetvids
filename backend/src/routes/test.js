import express from "express";
import { inngest } from "../lib/inngest.js";

const router = express.Router();

// Test webhook endpoint
router.post("/webhook", async (req, res) => {
  console.log("[TEST] Simulating Clerk webhook");
  
  try {
    const { type, testData } = req.body;
    
    console.log("[TEST] Event type:", type);
    console.log("[TEST] Test data:", testData);
    
    // Send event to Inngest
    await inngest.send({
      name: type,
      data: testData
    });
    
    console.log("[TEST] Event sent to Inngest successfully");
    res.status(200).json({ 
      success: true, 
      message: "Test webhook sent to Inngest",
      eventType: type,
      testData: testData
    });
  } catch (error) {
    console.error("[TEST] Webhook test error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
