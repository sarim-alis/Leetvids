import express from "express";
import { connectDb } from "../lib/lib.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "../lib/stream.js";

const router = express.Router();

// Clerk webhook endpoint - direct database operations (no Inngest)
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  console.log("[CLERK] Webhook received");
  
  try {
    // req.body is a Buffer when using express.raw, convert to string then parse
    const evt = JSON.parse(req.body.toString());
    const { type } = evt;
    
    console.log("[CLERK] Event type:", type);
    
    // Handle user creation - direct database save
    if (type === 'user.created') {
      console.log("[CLERK] Processing user creation");
      await connectDb();
      
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
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
      
      console.log("[CLERK] User created successfully in database");
    }

    // Handle user deletion - direct database delete
    if (type === 'user.deleted') {
      console.log("[CLERK] Processing user deletion");
      await connectDb();
      
      const { id } = evt.data;
      await User.deleteOne({ clerkId: id });
      await deleteStreamUser(id.toString());
      
      console.log("[CLERK] User deleted successfully from database");
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[CLERK] Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
