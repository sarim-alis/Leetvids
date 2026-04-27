import express from "express";
import { connectDb } from "../lib/lib.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "../lib/stream.js";
const router = express.Router();

// Register user via clerk.
router.post("/webhook", async (req, res) => {
  
  try {
    const evt = req.body;
    const { type } = evt;
    if (type === 'user.created') {
      await connectDb();
      
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const newUser = { clerkId: id, email: email_addresses[0]?.email_address, name: `${first_name || ""} ${last_name || ""}`, profileImage: image_url || "" };

      await User.create(newUser);
      await upsertStreamUser({ id: newUser.clerkId.toString(), name: newUser.name, image: newUser.profileImage });
    }

    if (type === 'user.deleted') {
      console.log("[CLERK] Processing user deletion");
      await connectDb();
      
      const { id } = evt.data;
      await User.deleteOne({ clerkId: id });
      await deleteStreamUser(id.toString());
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
