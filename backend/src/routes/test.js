import express from "express";
import { connectDb } from "../lib/lib.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "../lib/stream.js";

const router = express.Router();

// Test webhook endpoint - direct database operations
router.post("/webhook", async (req, res) => {
  console.log("[TEST] Simulating Clerk webhook");
  
  try {
    const { type, testData } = req.body;
    
    console.log("[TEST] Event type:", type);
    console.log("[TEST] Test data:", testData);
    
    // Handle user creation - direct database save
    if (type === 'user.created') {
      console.log("[TEST] Processing user creation");
      await connectDb();
      
      const { id, email_addresses, first_name, last_name, image_url } = testData;
      const newUser = {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`,
        profileImage: image_url || ""
      };

      await User.create(newUser);
      await upsertStreamUser({
        id: newUser.clerkId.toString(),
        name: newUser.name,
        image: newUser.profileImage
      });
      
      console.log("[TEST] User created successfully in database");
    }

    // Handle user deletion - direct database delete
    if (type === 'user.deleted') {
      console.log("[TEST] Processing user deletion");
      await connectDb();
      
      const { id } = testData;
      await User.deleteOne({ clerkId: id });
      await deleteStreamUser(id.toString());
      
      console.log("[TEST] User deleted successfully from database");
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Test webhook processed directly",
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
