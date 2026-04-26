import express from "express";
import { inngest } from "../lib/inngest.js";

const router = express.Router();

// Clerk webhook endpoint - automatically triggers Inngest functions
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  console.log("[CLERK] Webhook received");
  
  try {
    const evt = JSON.parse(req.body);
    const { type } = evt;
    
    console.log("[CLERK] Event type:", type);
    
    // Send event to Inngest - this automatically triggers your functions
    if (type === 'user.created' || type === 'user.deleted') {
      console.log("[CLERK] Sending event to Inngest:", type);
      
      await inngest.send({
        name: type,
        data: evt.data
      });
      
      console.log("[CLERK] Event sent to Inngest successfully");
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[CLERK] Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
